type FormInitOptions = {
  formSelector: string;
  statusSelector: string;
  submitSelector: string;
  endpoint?: string;
  pendingMessage?: string;
  successFallbackMessage: string;
  genericErrorMessage: string;
  unavailableErrorMessage: string;
  buildPayload?: (formData: FormData, payload: Record<string, string>) => Record<string, string>;
};

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

const setStatus = (statusEl: Element | null, state: string, message: string) => {
  if (!(statusEl instanceof HTMLElement)) return;
  statusEl.textContent = message;
  statusEl.setAttribute("data-state", state);
};

const setLoadedAt = (loadedAtField: Element | null) => {
  if (!(loadedAtField instanceof HTMLInputElement)) return;
  loadedAtField.value = String(Date.now());
};

export const initContactForm = (options: FormInitOptions) => {
  const form = document.querySelector(options.formSelector);

  if (!(form instanceof HTMLFormElement)) return;

  const statusEl = form.querySelector(options.statusSelector);
  const submitButton = form.querySelector(options.submitSelector);
  const loadedAtField = form.querySelector("input[name='formLoadedAt']");

  setLoadedAt(loadedAtField);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    let payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    if (options.buildPayload) {
      payload = options.buildPayload(formData, payload);
    }

    if (!payload.formLoadedAt) {
      payload.formLoadedAt = String(Date.now());
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    setStatus(statusEl, "pending", options.pendingMessage ?? "Sending...");

    try {
      const response = await fetch(options.endpoint ?? "/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 404) {
        throw new Error(options.unavailableErrorMessage);
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || options.genericErrorMessage);
      }

      form.reset();
      setLoadedAt(loadedAtField);

      if (window.turnstile && typeof window.turnstile.reset === "function") {
        window.turnstile.reset();
      }

      setStatus(statusEl, "success", result.message || options.successFallbackMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : options.genericErrorMessage;
      setStatus(statusEl, "error", message);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
};

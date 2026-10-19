const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const formatMonthYear = (month: number, year: string): string =>
  `${monthNames[month - 1]} ${year}`;

export const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", { year: "numeric", month: "long" });

export const formatDateMetadata = (value: string): string => {
  const date = value.trim();

  if (/^\d{4}\??$/.test(date)) {
    return date;
  }

  const isoDateMatch = date.match(/^\d{4}-(\d{2})(?:-\d{2})?$/);

  if (isoDateMatch) {
    const month = Number(isoDateMatch[1]);
    return month >= 1 && month <= 12 ? formatMonthYear(month, date.slice(0, 4)) : date;
  }

  const numericMonthYearMatch = date.match(/^(\d{1,2})[/-](\d{4})$/);

  if (numericMonthYearMatch) {
    const month = Number(numericMonthYearMatch[1]);
    return month >= 1 && month <= 12
      ? formatMonthYear(month, numericMonthYearMatch[2])
      : date;
  }

  const numericDateMatch = date.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (numericDateMatch) {
    const first = Number(numericDateMatch[1]);
    const second = Number(numericDateMatch[2]);
    const month = first > 12 ? second : first;

    return month >= 1 && month <= 12
      ? formatMonthYear(month, numericDateMatch[3])
      : date;
  }

  const monthMatch = date.match(
    /\b(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)\b/i
  );
  const yearMatch = date.match(/\b\d{4}\b/);

  if (monthMatch && yearMatch) {
    const month = monthNames.findIndex(
      (name) => name.toLowerCase().slice(0, 3) === monthMatch[1].toLowerCase().slice(0, 3)
    );
    return formatMonthYear(month + 1, yearMatch[0]);
  }

  return date;
};

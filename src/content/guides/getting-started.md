---
title: "Guide to Making a Data Viz Style Guide"
summary: "A basic outline and set of best practices for creating a data visualization style guide for your organization."
draft: false
listing:
  source: "Data Visualization Style Guides"
  author: "Maxene Graze, Alan Wilson, Jonathan Schwabish, and Amy Cesal"
  type: "article"
---

## Introduction

This document aims to provide a basic outline for creating a data visualization style guide for your organization. It leverages our collective knowledge to establish a basic set of best practices, but won't go into great detail on specifics.

The goal is to create guidelines—not rules or immutable facts. Guidelines will change and evolve with the needs of your organization. It's important to set this expectation and create a culture that strikes a balance between common, generic needs (which guidelines can address very well) and bespoke, unique needs which are unlikely to be met by a style guide.

A style guide should empower the people in your organization that creates visualizations by reducing the number of decisions they have to make. It restricts creativity as little as possible.

### Why create a style guide?

A style guide will help your team maintain a consistent brand by providing a unified set of styles, processes, templates, and tools. It will also increase the effectiveness and efficiency of your team by reducing the number of decisions they need to make when creating a visualization. But a style guide takes work to create and maintain. If your organization is small, it may not be a worthwhile investment.

### Design System vs Style Guide

The venn diagram between a design system and a style guide has significant overlaps. But there are some important distinctions, the most notable of which is integration with software development teams. For instance, most design systems have tokens (variables) that capture decisions about color, size, font, etc. so they can be used by UI components (such as buttons). Changes to designs flow through these tokens into components libraries and products with very little disruption. A design system usually starts out as a style guide and only evolves into a design system if the people in the organization need those extra features and structure.

### Funding

You may need to secure resources to build a style guide. Look to the teams that will benefit the most from these guidelines for funding. Demonstrate value in small ways—qualitative data may be enough—but also look for ways to attribute the costs of building and maintaining a style guide to the benefits the organization receives. Be careful not to underestimate the cost and need for maintenance.

### Format

First and foremost, consider who will be using this guide. Make sure you understand and meet their expectations. If they want a PDF—deliver that. If they want a website, build it. Also, consider what tools you (and other guide authors) are most comfortable with. Can they use those tools to meet expectations? How difficult will it be to learn new tools?

If it is up to you, think about where the style guide can live that will be easiest for the users to find. For example, if the client is already used to consulting the design style guide for styles, consider integrating it there. In the best-case scenario, it would be located at a fixed, and easy-to-remember url: www.organization.com/datavizstyleguide.

### Adoption

A guide cannot provide value if it isn't used. Stay close to your users. Spend time watching how they work and listening to their frustrations. A style guide should reduce those frustrations. If possible, avoid mandates—it's always better to build something people want to use than to force them to use something they don't. Measure adoption so you know who is and isn't using the style guide—then find out why. Iterate.

### Development and iteration

It's ok to start small. Even a single page of guidance can be useful if it addresses the needs of your organization. Set up an expectation for changes, updates, and iteration by using a versioning system and creating clear channels for communicating updates.

### Research

A style guide provides answers to common questions—solutions to common problems. But where do those answers come from? Seek experts in and outside of your organization to help you write guidelines. Workshops, books, and research papers will bolster your own understanding of the space. This will have a collection of links and resources to get you started. Avoid leaning too heavily on any one source.

### Guiding Principles

When creating a style guide, it's important to establish basic principles about your intentions. These principles establish the criteria your organization needs to be successful. Include information about your mission and brand, but also address equity and accessibility. Avoid jargon and shallow generalities.

## Foundations

### Color

On the surface, establishing standards for color can seem daunting, but approaching it through a utilitarian lens, the task becomes much more manageable. Color in data visualizations usually takes one of three forms—categorical, sequential, or diverging.

#### Categorical color

When using color to establish categories, the goal is simple: to distinguish one thing (or group of things) from another. This is easiest when there are few categories and it becomes increasingly untenable the more you have. A maximum number of categories is often the first rule to establish. Once that is known you can set about creating your set of 4, 5, or 6 colors (ok, you may even go beyond 6, but you should try to avoid it). There are three main goals here:

1. Colors should be separate and distinct. No one should struggle to distinguish the difference between any two colors. Don't forget to accommodate people with color vision deficiencies (such as color blindness) or to create sufficient contrast with the background. Tools like [Adobe Color](https://color.adobe.com/create) and [Leonardo](https://leonardocolor.io/scales.html)'s qualitative scales are useful here.

2. Colors should be value-neutral. Category A should not look "better" or "more important" than category B. This is generally done by keeping the lightness or contrast ratio of your colors close to one another. Note that this goal is often in conflict with our first goal.

3. Colors should align with your organization's brand and its aesthetic aspirations. This doesn't mean they need to be one-to-one, but they should feel like part of the same family. This is—once again—often in conflict with our other goals.

One last note on this topic is semantic colors. This is important when categories aren't neutral. For example, it's common to use a red hue for errors and a blue one for things that are going well. Another time semantic color comes into place is when categories have specific color associations. If your categories were oranges, apples, and bananas it would only make sense to use orange, red, and yellow because we intuitively associate the meaning of each color. Some organizations have dozens of specific color mappings, others don't have any. What does your organization need?

#### Sequential color

When color is used to represent a numeric value or quantity, you should use a sequential color scale—sometimes referred to as a color ramp or a gradient. The simplest example would be something that starts out white on one side and becomes darker until you end up at black on the other side. It's generally best to map small values to the lighter side and larger ones to the darker side. You can of course use a hue (like blue or red) for this scale. You can also shift the hue of the scale to create scales that are not only aesthetically pleasing but make interpretation easier because they change along more than one color dimension at a time. Our goals for sequential color scales are:

1. Scales should change in a perceptually uniform way. The difference between 1 and 2 should be the same as the difference between 2 and 3.

2. As with categorical colors, you want things to align sequential color scales with your organization's brand and its aesthetic aspirations.

In your multi-hue explorations, you may find that a rainbow scale—one that traverses all hues like a color wheel is attractive, but there are many pitfalls to this approach. Remember our goals and stay away from rainbow scales.

#### Diverging palette

Diverging color scales are similar to sequential scales because they map quantities. The difference is that our colors are designed to show the distance (and direction) from a center point such as zero. On a diverging scale, zero may be white while -10 is dark red and +10 is dark green. Many techniques we learned with sequential scales apply here, but because we need two hues, we also share goals with categorical color creation. Specifically:

1. Our two color scales must be separate and distinct. No one should struggle to distinguish the difference between any two colors. Don't forget to accommodate people with color vision deficiencies (color blindness) and don't get too crazy with shifts in hue.

2. Scales should be perceptually uniform. The difference between -1 and 0 should be the same as the difference between 0 and 1.

#### Other color considerations

In addition to colors that encode data, you'll need to establish a more neutral set of colors for backgrounds, text, axis, and other marks. These are often shades of black and gray, but can be tinted to better align with your brand.

If your organization has a brand guide or design system, consider ways to integrate (and augment) them with data visualization guidelines.

#### Further reading and resources

- [Leonardo](https://leonardocolor.io)
- [A detailed guide to colors in data vis style guides](https://blog.datawrapper.de/colors-for-data-vis-style-guides/)
- [Color and Contrast](https://colorandcontrast.com)

### Typography

There is a good chance your organization already has standards around a specific typeface that you can leverage for data visualizations, but if not there a few things to keep in mind when defining typographic guidelines:

1. Focus on legibility. Find a typeface that's easy to read and supports characters in both upper and lower case. Multiple weights (ie bold, medium, regular, light) is also a big plus. Make sure there is at least one italic style as well.

2. Make sure the team has access to the typeface by using something open to all or purchasing a license. Make sure it works with the software you'll be using to create charts.

3. It's best to have fonts that support [tabular numbers](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings#enabling_various_font_features) with lining figures. This will make tables and other numeric text easier to read.

4. Avoid system fonts as they're unlikely to help you create a strong brand.

Defining text color and size can be done globally, but guidelines will be easier to follow if this is handled in templates and other more specific documentation.

### Size and dimensions

Understanding the size, proportions, and overall dimensions of visualizations will make guidelines more useful. For instance, if charts will be shared on a social media platform, it's best to have templates that accommodate the restrictions and nuances of that particular platform. And it's not just technical—your style guide should speak to the way people expect to use that platform.

Some platforms support responsiveness—text, images, and visualizations that shift and scale to accommodate a wide range of device sizes. Your guidelines should help authors scale charts appropriately by making layout adjustments at specific breakpoints, defining maximum and minimum sizes, and appropriate scaling of chart elements. In some cases people will need to create completely different versions of a chart to accommodate this wide range of screen sizes.

### Medium

The mediums your organization supports will inform what you include and how you structure it. Be sure guidelines are applicable to your organization. Having all color values in CMYK will do little good for a team responsible for the web where RGB or hexadecimal are more relevant. Interactive guidelines may need to address keyboard-only users. Consider animation. When should it be used? Provide guidance on duration, speed, and easing. You may even need to create guidelines for visualizations in virtual or augmented reality.

Possible mediums to consider:

- Print
- Mobile
- Web
- VR
- AR
- Social media

Make sure whatever you are writing is relevant to the mediums you are using. Some mediums may require specific information not relevant to others.

# FrontForge

![FrontForge Logo](https://imgur.com/uSCHOEJ.png)

[![npm version](https://img.shields.io/npm/v/@cnuebred/frontforge.svg?logo=npm)](https://www.npmjs.com/package/@cnuebred/frontforge)
[![npm downloads](https://img.shields.io/npm/dw/@cnuebred/frontforge)](https://www.npmjs.com/package/@cnuebred/frontforge)


**FrontForge** is a minimalist TypeScript-based frontend framework that allows you to describe your entire HTML structure, styles, and logic in code - and compile it into a complete, standalone HTML file. Ideal for generating simple UI apps or static pages directly from TypeScript.

This project was created out of pure passion by a beginner developer who strongly believes in simplicity, transparency, and minimal dependencies. FrontForge is intentionally built to stay lean, with no heavy abstractions or runtime overhead — just TypeScript and the browser DOM.

---

## ✨ Features

- 🧱 Declarative UI construction with `Widget` and `ContainerWidget`
- 🎯 Reactive state with `Pocket` (based on Proxy)
- 📦 Auto HTML/JS/CSS bundling with `ForgeBundle`
- ⚙️ Easy layout utilities via `Flex()` and `Grid()`
- 🖱️ Simple event handling with `.event()`
- 📄 Markdown-style inline content support
- 💨 Minimal dependencies, zero-runtime abstraction

---

## 📦 Installation

```bash
npm install @cnuebred/frontforge
```

Requires Node.js (LTS recommended) and TypeScript.

---

## 🚀 Quick Example

```ts
// >>> main.ts
import { Widget, ContainerWidget, ForgeBundle } from "@cnuebred/frontforge";

// Create UI elements
const header = new Widget("h1.title", "Welcome to FrontForge");
const button = new Widget("button", "Click me");

// React to click event
button.event("click", () => {
  header.value = "Button clicked!";
  header.render();
});

// Group in a container and attach to DOM
const container = new ContainerWidget("div");
container.add(header).add(button);
container.hook("body");
// >>> end of main.ts

import { ForgeBundle } from "@cnuebred/frontforge";

// Bundle and export as HTML
const bundle = new ForgeBundle();
await bundle.script("./main.ts");
await bundle.style("./style.scss");
bundle.head.title("My App");
bundle.build("index", "./dist");
```

---

## 🧰 API Overview

### Widget

```ts
const w = new Widget("p.text", "Hello");
w.attribute = { id: "my-id", style: "color: red;" };
w.value = "**Bold** content";
w.event("click", () => alert("clicked"));
w.render();
```

### ContainerWidget

```ts
const c = new ContainerWidget("div");
c.add(new Widget("span", "Child 1"));
c.add(new Widget("span", "Child 2"));
c.hook("body");
```

### Pocket (reactive state)

```ts
import { Pocket } from "@cnuebred/frontforge";

const p = new Pocket({ count: 0 });
const state = p.target;

p.set_setter_callback(({ property, new_value }) => {
  console.log(`${property} changed to ${new_value}`);
});

state.count++; // triggers the callback
```

### Flex / Grid Layouts

```ts
import { Flex, flex_direction_e, flex_justify_e, Widget } from "@cnuebred/frontforge";

const row = Flex([
  new Widget("div.box", "A"),
  new Widget("div.box", "B"),
], {
  direction: flex_direction_e.row,
  justify_content: flex_justify_e.space_between,
  height: 200
});

row.hook("body");
```

---

## 🛠️ Build & Bundle

Use `ForgeBundle` to compile your app to a standalone `.html` file with embedded styles and JS.

```ts
const bundle = new ForgeBundle();
await bundle.script("./src/app.ts");
await bundle.style("./src/styles.scss");

bundle.head.title("My Static Page");
bundle.head.meta({ name: "viewport", content: "width=device-width, initial-scale=1" });

bundle.build("index", "./dist");
```

---

## 🔧 Requirements

- Node.js (v16+ recommended)
- TypeScript
- Works in browser environments
- Uses: `esbuild`, `sass`, `crypto`, and modern ES features

---

## 🧪 Playground / Test

You can experiment with widgets like this:

```ts
const counter = new Widget("h2", () => `Count: ${state.count}`);
const button = new Widget("button", "Increment");
button.event("click", () => { state.count++ });

const layout = Flex([counter, button]);
layout.hook("body");
```

---

## 📈 Roadmap

- [ ] Component abstraction
- [ ] Data binding helpers
- [ ] Dev server with hot reload

---

## 🙋‍♂️ Author

Made with ❤️ by **Cube** ([@cnuebred](https://www.npmjs.com/~cnuebred))  
Feedback, issues, or contributions are welcome!
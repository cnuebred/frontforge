**FrontForge** is a highly declarative, minimalist TypeScript-based frontend framework that allows you to construct your entire HTML structure, complex styles, and application logic directly within your code. It serves as a unified ecosystem that compiles everything into a perfectly optimized, standalone HTML file with absolutely zero heavy runtime abstractions.  
Built for developers who love the raw speed and transparency of pure DOM manipulation, but still crave the elegance of a declarative API, the responsiveness of reactive state management, and the convenience of an integrated, zero-config bundler. FrontForge is your escape from JavaScript fatigue—no Virtual DOM, no massive dependency trees, just pure, native web performance.

🚀 Quickstart: Express.js Proof of Concept (PoC)

Want to see it in action immediately? Here is a single-file, copy-paste Proof of Concept. This script automatically spins up an Express server, generates a client-side TypeScript file on the fly, bundles it using FrontForge, and serves the rendered HTML directly to your browser.

```ts
import express from 'express';
import { ForgeBundle } from '@cnuebred/frontforge';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
  if (!fs.existsSync('client.ts')) {
    fs.writeFileSync('client.ts', `
      import { Widget, Flex, flex_direction_e } from '@cnuebred/frontforge';
      
      const title = new Widget('h1', 'Witaj we FrontForge! 🚀');
      const desc = new Widget('p', 'Strona wygenerowana i zaserwowana przez Express.js.');
      
      Flex([title, desc], { 
        direction: flex_direction_e.column,
        align_items: 'center' 
      }).hook('body');
    `);
  }

  const bundle = new ForgeBundle();
  bundle.head.title('FrontForge PoC');
  await bundle.script('./client.ts');
  
  const html = await bundle.build(); 
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`✅ Serwer uruchomiony! Kliknij link, aby otworzyć: http://localhost:${PORT}`);
});
```

`(Just run npm i express @cnuebred/frontforge, save this as server.ts, and execute it with npx tsx server.ts!)`


## **📑 Table of Contents**

* [Why FrontForge?](#bookmark=id.wd1fmfhe9vpg)  
* [Installation & Setup](#bookmark=id.9n4xd7cdvpn8)  
* [Core Concepts & API](#bookmark=id.362jjsnt7am3)  
  * [1\. Widget (The Building Block)](#bookmark=id.2715q21u3i33)  
  * [2\. ContainerWidget (Grouping & Lists)](#bookmark=id.pe746nppthf0)  
  * [3\. Pocket (Reactive State Management)](#bookmark=id.jatuvbjsahme)  
* [Layout System](#bookmark=id.tow3x19bhmfd)  
  * [Flexbox Wrappers (Flex)](#bookmark=id.q99pfm9lc696)  
  * [Matrix-Based CSS Grid (Grid)](#bookmark=id.7mwuwup40a98)  
* [Advanced Features](#bookmark=id.qyq8d4vmutsk)  
  * [Markdown & XSS Security](#bookmark=id.f4h4oc6m3v3z)  
  * [Lifecycle & Conditional Rendering](#bookmark=id.kcsy138kr8ei)  
  * [Widget Cloning](#bookmark=id.7ts0ladw9vqa)  
* [The Build System (ForgeBundle)](#bookmark=id.860sai59xd4o)  
* [Full Real-World Example: Task Manager App](#bookmark=id.4wvgw5iy4krc)  
* [Roadmap & Contributing](#bookmark=id.5bfkz0gy5ldq)

## **✨ Why FrontForge?**

In an era of increasingly complex and oversized web frameworks, FrontForge takes a step back to re-evaluate how we build the web, focusing on the following core pillars:

* **No Virtual DOM Overhead:** Instead of computing differences in a massive Javascript object tree (VDOM) on every state change, FrontForge updates the actual DOM directly. This results in highly predictable memory usage and blazing-fast render times.  
* **TypeScript Native:** Written entirely in TypeScript, FrontForge offers comprehensive type safety out of the box. Your IDE will auto-complete widget properties, CSS attributes, and layout constraints instantly, catching layout errors before they reach the browser.  
* **Declarative Syntax:** Write your UI exactly how you write your logic. Building a complex DOM tree is as simple as chaining .add() methods and passing arrays to our Grid/Flex utilities.  
* **Built-in Bundler (ForgeBundle):** Forget about configuring Webpack, Vite, or Rollup. FrontForge includes its own esbuild and sass powered bundler. You execute a single TypeScript file, and it outputs a complete .html file with your minified CSS and JS embedded or linked.  
* **Zero Bloat & Dependency Hell:** Minimal dependencies mean a smaller footprint, drastically faster installation times, and significantly less risk of supply-chain vulnerabilities. What you write is precisely what gets executed.

## **📦 Installation & Setup**

To get started with FrontForge, you'll need a Node.js environment (v16+ LTS is highly recommended) and TypeScript installed in your project.  
Initialize your project and install the library via npm:  

```bash
mkdir my-frontforge-app  
cd my-frontforge-app  
npm init \-y  
npm install @cnuebred/frontforge  
npm install \-D typescript tsx  
npx tsc \--init
```

*Pro Tip: We recommend using tsx or ts-node to execute your build scripts directly.*

## **🛠 Core Concepts & API**

### **1\. Widget (The Building Block)**

The Widget class is the atomic unit of FrontForge. It represents a single HTML element in the DOM. When instantiating a Widget, you can utilize an Emmet-style syntax to define the HTML tag and its initial classes simultaneously.  

```ts
import { Widget } from "@cnuebred/frontforge";
// Define a \<button\> tag with "btn" and "btn-primary" classes in one string  
const btn \= new Widget("button.btn.btn-primary", "Click Me\!");

// Safely modify classes on the fly using the built-in class operator  
btn.class.add("active");  
btn.class.toggle("highlight"); // Toggles the class on/off  
btn.class.remove("btn-primary");

// Add arbitrary DOM attributes or strictly typed inline styles  
btn.attribute \= {  
  id: "submit-button",  
  disabled: false,  
  "data-tooltip": "Sends the form securely",  
  "aria-label": "Submit Form"  
};

// Styles use standard JavaScript camelCase syntax which is automatically   
// converted to kebab-case CSS by the engine.  
btn.style.backgroundColor \= "\#ff5722";  
btn.style.borderRadius \= "8px";

// Attach standardized event listeners  
btn.event("click", (e) \=\> {  
  console.log("Button clicked\!", e);  
});

// Finally, render and attach the widget to the DOM  
btn.hook("body"); // Appends to the end of the \<body\> tag
```

**Dynamic Content Evaluation:**  
A Widget's content doesn't have to be static. You can pass a callback function that evaluates dynamically every time render() is called. 
```ts
let userClicks \= 0;

// The content function evaluates whenever .render() is triggered  
const clickCounter \= new Widget("span.badge", () \=\> \`Total Clicks: ${userClicks}\`);

btn.event("click", () \=\> {  
  userClicks++;  
  clickCounter.render(); // Instantly updates the DOM text node  
});
```

### **2\. ContainerWidget (Grouping & Lists)**

ContainerWidget extends the base Widget but adds powerful logic for managing an array of child Widgets. It is essential for constructing complex component trees, managing lists, and handling bulk DOM insertions.  

```ts
import { ContainerWidget, Widget } from "@cnuebred/frontforge";

const mainCard \= new ContainerWidget("div.card.shadow-lg");  
const title \= new Widget("h2.card-title", "User Profile");  
const description \= new Widget("p.card-desc", "Manage your account settings below.");

// Chainable additions make tree construction highly readable  
mainCard.add(title).add(description);

// List Management Features  
// You can iterate over children, map them, or clear them dynamically  
const actionRow \= new ContainerWidget("div.actions");  
actionRow.set(\[  
  new Widget("button", "Save"),  
  new Widget("button", "Cancel")  
\]);

// If state changes, you can clear the container and re-populate it safely  
// without leaving orphaned event listeners in memory.  
actionRow.clear(); 

mainCard.add(actionRow);  
mainCard.hook("\#app-root"); // Hook into a specific DOM ID
```

### **3\. Pocket (Reactive State Management)**

Forget complex useState hooks or verbose state management libraries. Pocket is a lightweight, ES6 Proxy-based state manager. It wraps your data objects, intercepts reads and writes, and allows you to trigger UI updates automatically whenever your state mutates.  

```ts
import { Pocket, Widget } from "@cnuebred/frontforge";

// 1\. Define your initial reactive state  
const appState \= new Pocket({   
  score: 0,   
  user: "Player 1",  
  theme: "dark"  
});

// 2\. Create UI widgets that depend on the state  
const scoreDisplay \= new Widget("h1", () \=\> \`${appState.target.user} Score: ${appState.target.score}\`);

// 3\. React to changes automatically via the setter callback  
appState.set\_setter\_callback((target, property, value) \=\> {  
  console.log(\`State Property \[${String(property)}\] updated to:\`, value);  
    
  // Whenever any property changes, we instruct the display to re-render  
  scoreDisplay.render();  
});

// 4\. Update the state naturally.   
// You don't need special setter functions; just reassign the value\!  
const incrementBtn \= new Widget("button", "Add \+10 Points");  
incrementBtn.event("click", () \=\> {  
  appState.target.score \+= 10; // This seamlessly triggers the setter callback  
});

scoreDisplay.hook("body");  
incrementBtn.hook("body");
```
## **📐 Layout System**

Writing CSS layouts by hand can be tedious. FrontForge provides highly declarative layout wrappers for standard CSS Flexbox and Grid, converting TypeScript configurations into perfectly formatted CSS on the fly.

### **Flexbox Wrappers (Flex)**

The Flex wrapper quickly aligns items inside a newly generated ContainerWidget without requiring you to manually write CSS classes.  

```ts
import { Flex, flex\_direction\_e, flex\_justify\_e, flex\_align\_items\_e, Widget } from "@cnuebred/frontforge";

const avatar \= new Widget("img").attribute \= { src: "avatar.png" };  
const username \= new Widget("span", "JohnDoe99");  
const logoutBtn \= new Widget("button", "Logout");

// Creates a flex container holding the 3 widgets  
const navbar \= Flex(\[avatar, username, logoutBtn\], {  
  direction: flex\_direction\_e.row,  
  justify\_content: flex\_justify\_e.space\_between,  
  align\_items: flex\_align\_items\_e.center,  
  column\_gap: "20px",  
  width: "100%",  
  height: "64px"  
});

navbar.style.borderBottom \= "1px solid \#ccc";  
navbar.hook("body");
```
### **Matrix-Based CSS Grid (Grid)**

This is one of FrontForge's most powerful features. Create complex 2D layouts by literally drawing them in your code using a two-dimensional matrix (an array of arrays). It supports deep CSS Grid customizations including automatic col\_span and row\_span calculations.  
```ts
import { Grid, Widget } from "@cnuebred/frontforge";

const header \= new Widget("header.bg-blue", "Application Header");  
const sidebar \= new Widget("aside.bg-gray", "Navigation Menu");  
const content \= new Widget("main.bg-white", "Main Dashboard Content");  
const footer \= new Widget("footer.bg-dark", "System Footer");

// Visually define a 2D matrix representing rows and columns  
const dashboardLayout \= Grid(\[  
  // Row 1: Header spans across 2 columns  
  \[ { widget: header, col\_span: 2 } \],  
    
  // Row 2: Sidebar takes column 1, Content takes column 2  
  \[ sidebar, content \],  
    
  // Row 3: Footer spans across 2 columns  
  \[ { widget: footer, col\_span: 2 } \]  
\], {  
  gridTemplateColumns: "250px 1fr", // 250px fixed sidebar, remaining space for content  
  gridTemplateRows: "70px 1fr 50px", // fixed header, fluid content, fixed footer  
  height: "100vh",  
  width: "100vw",  
  column\_gap: "1rem",  
  row\_gap: "1rem"  
});

dashboardLayout.hook("body");
```
## **🪄 Advanced Features**

### **Markdown & XSS Security**

By default, FrontForge parses basic Markdown syntax inside your Widget content and converts it safely to HTML. The internal text\_to\_markdown engine automatically sanitizes inputs to prevent Cross-Site Scripting (XSS).

* Converts \# to \<h1\>, text to \<b\>, \[link\](url) to \<a\>.  
* Automatically escapes potentially dangerous characters (\<, \>, &).  
* Blocks dangerous href links like javascript: or data: schemas, replacing them with safe fallback strings.

```ts
const article \= new Widget("div");

// This safe markdown will automatically be converted to HTML:  
article.content \= \`  
\#\# Secure Content Delivery  
This text is \*\*bold\*\*.   
\[This is a safe link\](https://frontforge.dev).  
\[This is blocked\](javascript:alert('xss'))  
\`;

article.hook("body");
```
### **Lifecycle & Conditional Rendering**

Instead of adding and removing widgets from the DOM constantly (which is computationally expensive), FrontForge allows you to mount logic to decide whether a widget should be visible or hidden (via CSS display: none) using the show\_when() lifecycle method.  
```ts
const uiState \= new Pocket({ userLoggedIn: false });

const adminPanel \= new Widget("div.admin-panel", "Welcome to the secret area\!");

// Will only display if the callback evaluates to true.  
// Otherwise, it automatically applies \`display: none\`.  
adminPanel.show\_when(() \=\> uiState.target.userLoggedIn);

uiState.set\_setter\_callback(() \=\> {  
  adminPanel.render(); // Re-evaluates the show\_when condition  
});

To entirely remove an element from the DOM, you can utilize the unhook() method:  
const temporaryAlert \= new Widget("div.alert", "Data saved\!");  
temporaryAlert.hook("body");

setTimeout(() \=\> {  
  temporaryAlert.unhook(); // Completely detached from the DOM tree  
}, 3000);
```
### **Widget Cloning**

Need to create multiple similar elements without rewriting the definition? Use .clone(). By default, it duplicates the widget, its styles, its attributes, and optionally re-binds its event listeners (with\_events: true).  
```ts
const baseButton \= new Widget("button.btn", "Standard Button");  
baseButton.event("click", () \=\> console.log("Clicked\!"));

const specialButton \= baseButton.clone();  
specialButton.content \= "Special Button";  
specialButton.class.add("btn-special");  
// specialButton retains the original "click" console.log event\!
```
## **📦 The Build System (ForgeBundle)**

FrontForge acts as its own build system. There is no need for Webpack or Vite. You can write a build script (e.g., build.ts) to bundle your TypeScript application logic, compile your SCSS architecture, and output a perfect, static index.html file that's ready for production deployment.  
Under the hood, ForgeBundle orchestrates esbuild for lightning-fast JS minification and sass for style compilation.  
**build.ts**  
```ts
import { ForgeBundle } from "@cnuebred/frontforge";

async function compileApp() {  
  const bundle \= new ForgeBundle();

  console.log("Starting build process...");

  // 1\. Compile SASS/SCSS to CSS, minify it, and inject it into the bundle  
  await bundle.style("./src/styles.scss");

  // 2\. Bundle TypeScript to pure Javascript.   
  // You can even pass environment variables to the 'define' object\!  
  await bundle.script("./src/main.ts", { API\_URL: "'\[https://api.myapp.com\](https://api.myapp.com)'" }, "1.0.0");

  // 3\. Configure the \<head\> of the generated HTML document  
  bundle.head.title("My Awesome FrontForge App");  
  bundle.head.meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" });  
  bundle.head.meta({ charset: "UTF-8" });  
  bundle.head.meta({ name: "description", content: "A fast, minimalist web app." });

  // 4\. Generate the final HTML structure and save it to the disk  
  await bundle.build("./dist/index.html");  
    
  console.log("Build complete\! Check the /dist folder for index.html.");  
}
compileApp();
```

## **🚀 Full Real-World Example: Task Manager App**

Here is how you can tie all of the core FrontForge patterns together to build a fully functional, state-driven Task Manager app in a single file.  
```ts
import { Widget, ContainerWidget, Flex, Pocket, flex\_direction\_e } from "@cnuebred/frontforge";

// 1\. Application State Setup  
const state \= new Pocket({  
  todos: \["Learn FrontForge", "Build a declarative app", "Deploy to Vercel"\],  
  inputValue: ""  
});

// 2\. Instantiate Base UI Elements  
const appTitle \= new Widget("h1.text-primary", "My Task Manager");  
const taskInput \= new Widget("input.todo-input");  
taskInput.attribute \= { placeholder: "What needs to be done?", type: "text" };

const submitBtn \= new Widget("button.todo-btn.btn-success", "Add Task");  
const listContainer \= new ContainerWidget("ul.task-list");

// 3\. Logic: Rendering the Reactive List  
const renderTaskList \= () \=\> {  
  listContainer.clear(); // Wipe the current container list  
    
  state.target.todos.forEach((taskText, index) \=\> {  
    // Create a flex row for each task item  
    const listItem \= new Flex(\[  
      new Widget("span.task-text", taskText),  
      new Widget("button.btn-danger", "Delete").event("click", () \=\> {  
        // Mutate state and re-render  
        state.target.todos.splice(index, 1);  
        renderTaskList();  
      })  
    \], {  
      justify\_content: "space-between",  
      align\_items: "center",  
      width: "100%"  
    });  
      
    // Add the newly created flex row to the ul container  
    listContainer.add(listItem);  
  });  
    
  listContainer.render(); // Flush the DOM updates  
};

// 4\. Logic: Event Handling & State Mutation  
taskInput.event("input", (e: any) \=\> {  
  state.target.inputValue \= e.target.value;  
});

submitBtn.event("click", () \=\> {  
  if (state.target.inputValue.trim() \!== "") {  
    state.target.todos.push(state.target.inputValue); // Push to array  
    state.target.inputValue \= ""; // Clear state memory  
    (taskInput.self as HTMLInputElement).value \= ""; // Clear DOM input visually  
    renderTaskList();  
  }  
});

// 5\. Macro Layout & Mounting  
const applicationLayout \= Flex(\[  
  appTitle,  
  Flex(\[taskInput, submitBtn\], { column\_gap: "10px", width: "100%" }),  
  listContainer  
\], {  
  direction: flex\_direction\_e.column,  
  row\_gap: "20px",  
  width: "500px",  
  margin: "0 auto" // Centers the app using standard CSS  
});

// Hook the entire application tree into the document body  
applicationLayout.hook("body");

// Trigger the initial render loop  
renderTaskList(); 
```
## **📈 Roadmap & Contributing**

FrontForge is evolving quickly. While the core API is stable, here is what is currently planned for future releases:

* \[x\] Basic UI Component & Widget architecture  
* \[x\] Native Proxy-based State Management (Pocket)  
* \[x\] Internal ESBuild/SASS Integration (ForgeBundle)  
* \[x\] Grid & Flex Layout wrappers with deep customization  
* \[ \] **Router Module:** Native support for Single Page Applications (SPA) with history API management.  
* \[ \] **Animation Wrapper:** A declarative syntax for native CSS transitions and keyframe animations upon Widget mount/unmount.  
* \[ \] **Development Server:** A built-in dev server featuring Hot Module Replacement (HMR) for faster prototyping.  
* \[ \] **Component Abstraction Layer:** Higher-order functions to create reusable, pre-styled widget templates.

### **Contributing**

FrontForge is completely open-source and released under the **MIT License**.  
We welcome contributions of all kinds\! Whether it's reporting a bug, suggesting a feature, improving the documentation, or submitting a Pull Request. Please feel free to open an issue on our GitHub repository.  
Made with ❤️ by **Cube** ([@cnuebred](https://www.npmjs.com/~cnuebred)).
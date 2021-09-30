import "focus-visible/dist/focus-visible";
import React from "react";
import ReactDOM from "react-dom";
import "tslib";

import { testCore } from "@splootcode/editor";

// import { App } from "./app.js";
// import { stringWidth } from "./layout/rendered_childset_block.js";
// import { AppProviders } from "../packages/core/src/providers.js";

const root = document.getElementById("app-root");

// Force the web font to be loaded as soon as the page loads (before we try to render the editor).
// stringWidth('loadfontplz')

testCore()

ReactDOM.render(
  // <AppProviders>
  //   <App />
  // </AppProviders>,
  <div>HI</div>,
  root
);

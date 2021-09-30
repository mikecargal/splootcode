import "focus-visible/dist/focus-visible";
import React from "react";
import ReactDOM from "react-dom";
import "tslib";

import { initialise } from "@splootcode/editor";

import { App } from "./app";
import { AppProviders } from "./components/providers";

const root = document.getElementById("app-root");

initialise()

ReactDOM.render(
  <AppProviders>
    <App />
  </AppProviders>,
  root
);

import { PythonConsole } from "@splootcode/editor";
import React from "react";
import ReactDOM from "react-dom";
import "tslib";

import { AppProviders } from "../components/providers";

const root = document.getElementById('app-root')

ReactDOM.render(
  <AppProviders>
    <PythonConsole/>
  </AppProviders>,
  root
);

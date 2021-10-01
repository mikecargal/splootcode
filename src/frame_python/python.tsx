import "tslib"
import React from "react"
import ReactDOM from "react-dom"

import { PythonConsole } from "@splootcode/editor"

const root = document.getElementById('app-root')

ReactDOM.render(
  <PythonConsole/>,
  root
);


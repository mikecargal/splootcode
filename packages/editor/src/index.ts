import { stringWidth } from "./layout/rendered_childset_block.js"
import {loadTypes} from "@splootcode/core"

export function initialise() {
    stringWidth('forcestringloading')
    loadTypes()
    console.log('SplootCode editor initialised')
}

export { PythonFrame } from './components/python/python_frame.js'
export { Editor } from './components/editor/editor.js';

export { NodeBlock } from './layout/rendered_node.js';
export { EditorStateContext, EditorState, DataSheetState } from './context/editor_context.js';
export { ViewPage } from './components/preview/frame_view.js';
export { DataSheetEditor } from "./components/datasheet/datasheet.js"

export { PythonConsole } from "./view/python_console"

export { initHiddenFrame } from "./view/hidden_frame.js"
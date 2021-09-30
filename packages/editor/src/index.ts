import { loadTypes } from "./language/type_loader.js"
import { stringWidth } from "./layout/rendered_childset_block.js"

export function initialise() {
    stringWidth('forcestringloading')
    loadTypes()
    console.log('SplootCode editor initialised')
}

export { SplootNode } from "./language/node.js"

export { Project, SerializedProject, FileLoader, ProjectLayoutType } from "./language/projects/project.js"
export { SplootPackage, SerializedSplootPackage, SerializedSplootPackageRef, FileType } from "./language/projects/package.js"
export { SerializedSplootFileRef, SplootFile } from "./language/projects/file.js"

export { SerializedNode } from "./language/type_registry.js"

export { PythonFrame } from './components/python/python_frame.js'
export { Editor } from './components/editor/editor.js';

export { DATA_SHEET, SplootDataSheet } from './language/types/dataset/datasheet.js';
export { NodeBlock } from './layout/rendered_node.js';
export { EditorStateContext, EditorState, DataSheetState } from './context/editor_context.js';
export { ViewPage } from './components/preview/frame_view.js';
export { DataSheetEditor } from "./components/datasheet/datasheet.js"
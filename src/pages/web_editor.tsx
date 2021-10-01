import { Project, SplootPackage } from "@splootcode/core"
import { DataSheetEditor, DataSheetState, Editor, EditorState, EditorStateContext, ViewPage } from '@splootcode/editor';
import React from 'react'


interface WebEditorProps {
  project: Project;
  selectedFile: EditorState;
  isNodeEditor: boolean;
  selectedDatasheet: DataSheetState;
}

export class WebEditorPanels extends React.Component<WebEditorProps> {

  render() {
    const { project, selectedFile, selectedDatasheet, isNodeEditor } = this.props;
    let onlyPackage : SplootPackage = project.packages[0];

    return (
      <React.Fragment>
        <div className="web-editor-column">
          {
            ((selectedFile || selectedDatasheet)) ?
                (
                  (isNodeEditor) ?
                  <EditorStateContext.Provider value={selectedFile}>
                    <Editor block={selectedFile.rootNode} selection={selectedFile.selection} width={300} />
                  </EditorStateContext.Provider>
                  :
                  <DataSheetEditor dataSheetState={selectedDatasheet}/>
                )
            : null
          }
        </div>
        <div className={'web-editor-preview-panel'} >
          <ViewPage pkg={onlyPackage}/>
        </div>
      </React.Fragment>
    );
  }
}
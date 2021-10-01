
import { typeRegistry } from "../lib/loader.js";
import { SplootNode } from "../node.js";
import { generateScope } from "../scope/scope.js";
import { DATA_SHEET, SplootDataSheet } from "../types/dataset/datasheet.js";
import { HTML_DOCUMENT, SplootHtmlDocument } from "../types/html/html_document.js";
import { JavascriptFile, JAVASCRIPT_FILE } from "../types/js/javascript_file.js";
import { PythonFile, PYTHON_FILE } from "../types/python/python_file.js";
import { deserializeNode, SerializedNode } from "../type_registry.js";
import { SerializedSplootFileRef, SplootFile } from "./file.js";
import { FileLoader } from "./project.js";

export interface SerializedSplootPackageRef {
  name: string;
}

export interface SerializedSplootPackage {
  name: string;
  files: SerializedSplootFileRef[];
  entryPoints: string[];
}

export enum FileType {
  HtmlDocument = 'HTML',
  JavaScript = "JS",
  DataSheet = "DATASHEET",
  Python = "PY"
}

export class SplootPackage {
  projectId: string;
  name: string;
  files: { [key:string]: SplootFile };
  fileOrder: string[];
  fileLoader: FileLoader;
  entryPoints: string[];

  constructor(projectId: string, pack: SerializedSplootPackage, fileLoader: FileLoader) {
    this.projectId = projectId;
    this.name = pack.name;
    this.fileLoader = fileLoader;
    this.fileOrder = pack.files.map(file => file.name);
    this.files = {};
    pack.files.forEach(file => {
      this.files[file.name] = new SplootFile(file.name, file.type);
    })
  }

  serialize() : string {
    let ser : SerializedSplootPackage = {
      name: this.name,
      entryPoints: this.entryPoints,
      files: [],
    };
    this.fileOrder.forEach(filename => {
      ser.files.push(this.files[filename].getSerializedRef());
    });
    return JSON.stringify(ser, null, 2) + '\n';
  }

  getDefaultFile() : SplootFile {
    return this.files[this.fileOrder[0]];
  }

  async createNewFile(name: string, type: FileType) {
    let rootNode : SplootNode = null;
    let splootNodeType = '';
    switch(type) {
      case FileType.DataSheet:
        rootNode = new SplootDataSheet(null);
        splootNodeType = DATA_SHEET;
        break;
      case FileType.HtmlDocument:
        rootNode = new SplootHtmlDocument(null);
        splootNodeType = HTML_DOCUMENT;
        break;
      case FileType.JavaScript:
        rootNode = new JavascriptFile(null);
        splootNodeType = JAVASCRIPT_FILE;
        generateScope(rootNode);
        rootNode.recursivelySetMutations(true);
        break;
      case FileType.Python:
        rootNode = new PythonFile(null);
        splootNodeType = PYTHON_FILE;
        generateScope(rootNode);
        rootNode.recursivelySetMutations(true);
        break;
      default:
        throw Error(`Invalid file type: ${type}`);
    }
    await this.addFile(name, splootNodeType, rootNode);
  }

  async addFile(name: string, type: string, rootNode: SplootNode) {
    let splootFile = new SplootFile(name, type);
    splootFile.fileLoaded(rootNode);
    this.files[name] = splootFile;
    this.fileOrder.push(name);
  }

  async getLoadedFile(name: string) : Promise<SplootFile> {
    let file = this.files[name];
    if (!file.isLoaded) {
      console.log(typeRegistry)
      return await this.fileLoader.loadFile(this.projectId, this.name, name).then((serNode : SerializedNode) => {
        let rootNode = deserializeNode(serNode);
        generateScope(rootNode);
        rootNode.recursivelySetMutations(true);
        file.fileLoaded(rootNode);
        return file;
      });
    }
    return file;
  }
}

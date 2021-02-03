
import { SplootNode } from "../node";
import { SerializedSplootFileRef, SplootFile } from "./file";
import { FileLoader } from "./project";


export interface SerializedSplootPackage {
  name: string;
  files: SerializedSplootFileRef[];
  buildType: string;
  entryPoints: string[];
}

enum PackageType {
  STATIC = 0,
  JS_BUNDLE,
  STYLE_BUNDLE,
}

export class SplootPackage {
  projectId: string;
  name: string;
  files: { [key:string]: SplootFile };
  fileOrder: string[];
  buildType: PackageType;
  fileLoader: FileLoader;
  entryPoints: string[];

  constructor(projectId: string, pack: SerializedSplootPackage, fileLoader: FileLoader) {
    this.projectId = projectId;
    this.name = pack.name;
    this.fileLoader = fileLoader;
    this.buildType = PackageType[pack.buildType];
    this.files = {};
    this.fileOrder = [];
    this.entryPoints = pack.entryPoints;
    pack.files.forEach(serializedFile => {
      let file = new SplootFile(serializedFile);
      this.files[file.name] = file;
      this.fileOrder.push(file.name);
    });
  }

  async getLoadedFile(name: string) : Promise<SplootFile> {
    let file = this.files[name];
    if (!file.isLoaded) {
      return await this.fileLoader.loadFile(this.projectId, this.name, name).then((rootNode : SplootNode) => {
        file.fileLoaded(rootNode);
        return file;
      });
    }
    return file;
  }
}
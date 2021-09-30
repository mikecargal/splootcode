import { SerializedNode } from "../type_registry.js";
import { SerializedSplootPackageRef, SplootPackage } from "./package.js";

export interface SerializedProject {
  name: string;
  layouttype: string;
  title: string;
  splootversion: string;
  packages: SerializedSplootPackageRef[];
}

export interface FileLoader {
  loadPackage: (projectId: string, packageId: string) => Promise<SplootPackage>;
  loadFile: (projectId: string, packageId: string, filename: string) => Promise<SerializedNode>;
}

export enum ProjectLayoutType {
  WEB = "WEB",
  PYTHON_CLI = "PYTHON_CLI"
}

export class Project {
  name: string;
  layoutType: ProjectLayoutType;
  title: string;
  splootversion: string;
  packages: SplootPackage[];
  fileLoader: FileLoader;

  constructor(proj: SerializedProject, packages: SplootPackage[], fileLoader: FileLoader) {
    this.name = proj.name;
    this.title = proj.title;
    this.fileLoader = fileLoader;
    this.packages = packages;
    switch (proj.layouttype) {
      case ProjectLayoutType.PYTHON_CLI:
        this.layoutType = ProjectLayoutType.PYTHON_CLI;
        break;
      default:
        this.layoutType = ProjectLayoutType.WEB;
    }
  }

  getDefaultPackage() : SplootPackage {
    return this.packages[0];
  }

  serialize() : string {
    let serProj : SerializedProject = {
      name: this.name,
      layouttype: this.layoutType,
      title: this.title,
      splootversion: this.splootversion,
      packages: this.packages.map(pack => {
        let packRef : SerializedSplootPackageRef = {
          name: pack.name,
        };
        return packRef;
      })
    };
    return JSON.stringify(serProj, null, 2) + '\n';
  }
}
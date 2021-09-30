import { FileLoader, SerializedNode, SerializedSplootPackage, SplootNode, SplootPackage } from "@splootcode/editor";

export class StaticFileLoader implements FileLoader {
  rootProjectUrl: string;
  
  constructor(rootProjectUrl: string) {
    if (!rootProjectUrl.endsWith('/')) {
      rootProjectUrl += '/';
    }
    this.rootProjectUrl = rootProjectUrl;
  }
  
  async loadPackage(projectId: string, packageId: string) : Promise<SplootPackage> {
    let packStr = await (await fetch(this.rootProjectUrl + packageId + '/package.sp')).text()
    let pack = JSON.parse(packStr) as SerializedSplootPackage;
    return new SplootPackage(projectId, pack, this);
  }
  
  async loadFile(projectId: string, packageId: string, filename: string) : Promise<SerializedNode> {
    let fileStr = await (await fetch(this.rootProjectUrl + packageId + '/' + filename + '.sp')).text()
    let serNode = JSON.parse(fileStr) as SerializedNode;
    return serNode;
  }
}
import { FileLoader, SerializedNode, SerializedSplootPackage, SplootNode, SplootPackage } from "@splootcode/core";



export class FileSystemFileLoader implements FileLoader {
  directoryHandle: FileSystemDirectoryHandle

  constructor(directoryHandle: FileSystemDirectoryHandle) {
    this.directoryHandle = directoryHandle;
  }

  async loadPackage(projectId: string, packageId: string) : Promise<SplootPackage> {
    let packDirHandle = await this.directoryHandle.getDirectoryHandle(packageId);
    let packStr = await (await (await packDirHandle.getFileHandle('package.sp')).getFile()).text();
    let pack = JSON.parse(packStr) as SerializedSplootPackage;
    return new SplootPackage(projectId, pack, this);
  }

  async loadFile(projectId: string, packageId: string, filename: string) : Promise<SerializedNode> {
    let packDirHandle = await this.directoryHandle.getDirectoryHandle(packageId);
    let fileStr = await (await (await packDirHandle.getFileHandle(filename + '.sp')).getFile()).text();
    let serNode = JSON.parse(fileStr) as SerializedNode;
    return serNode;
  }
} 
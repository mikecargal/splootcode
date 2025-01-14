import { Project, SerializedProject } from '@splootcode/core/language/projects/project'
import { StaticFileLoader } from '@splootcode/core/code_io/static_file_loader'

export async function loadExampleProject(projectId: string): Promise<Project> {
  const rootUrl = '/static/projects/' + projectId + '/'
  const fileLoader = new StaticFileLoader(rootUrl)
  const projStr = await (await fetch(rootUrl + 'project.sp')).text()
  const proj = JSON.parse(projStr) as SerializedProject
  const packages = proj.packages.map(async (packRef) => {
    return fileLoader.loadPackage(proj.name, packRef.name)
  })
  return new Project(proj, await Promise.all(packages), fileLoader)
}

export default class Instance {
  constructor (folderPath, instName, instVersion, remoteUrl = null, urlType = null) {
    this.folder = folderPath
    this.name = instName
    this.version = instVersion
    this.url = remoteUrl
    this.type = urlType
  }
}

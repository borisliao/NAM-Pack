// -----------------------------------------------------------
// **HostClient**
// Responsible for managing and controlling MultiMC
// -----------------------------------------------------------
import path from 'path'
import fs from 'fs-extra'

async function listDirectories (rootPath) {
  const fileNames = await fs.promises.readdir(rootPath)
  const filePaths = fileNames.map(fileName => path.join(rootPath, fileName))
  const filePathsAndIsDirectoryFlagsPromises = filePaths.map(async filePath => ({ path: filePath, isDirectory: (await fs.promises.stat(filePath)).isDirectory() }))
  const filePathsAndIsDirectoryFlags = await Promise.all(filePathsAndIsDirectoryFlagsPromises)
  return filePathsAndIsDirectoryFlags.filter(filePathAndIsDirectoryFlag => filePathAndIsDirectoryFlag.isDirectory)
    .map(filePathAndIsDirectoryFlag => filePathAndIsDirectoryFlag.path)
}

class Instance {
  constructor(folderPath, instName, instVersion) {
    this.folder = folderPath
    this.name = instName
    this.version = instVersion
  }
}

export default class HostClient {
  /**
   * @param {String} pathToFolder Location of working folder (not executable)
   */
  constructor (pathToFolder) {
    this.mainFolder = pathToFolder

    if (process.platform === 'darwin') {
      this.executablePath = path.join(this.mainFolder, 'MultiMC.app')
    } else if (process.platform === 'win32') {
      this.executablePath = path.join(this.mainFolder, 'MultiMC', 'MultiMC.exe')
      this.instancePath = path.join(this.mainFolder, 'MultiMC', 'instances')
    } else {
      this.executablePath = null
    }
  }

  /**
  * Checks if MultiMC executable exists
  * @returns true if exists, false otherwise
  */
  exists () {
    if (fs.existsSync(this.executablePath)) {
      return true
    } else {
      return false
    }
  }

  /**
   * Determines if a instance exists on disk by name
   * @param {String} inst name of instance to search
   * @param {String} method folder, manifest.json, instance.cfg
   */
  existsInstance (inst, method = 'folder') {
    const directories = listDirectories(this.instancePath)

    if (method === 'folder') {
      return directories.includes(inst)
    } else if (method === 'manifest.json') {
      directories.forEach(element => {
        const manifestPath = path.join(this.instancePath, directories, 'manifest.json')
        if (fs.existsSync(manifestPath)) {
          const manifest = require(manifestPath)
          if (manifest.name === inst) {
            return true
          }
        } else {
          console.error(manifestPath + ' does not exist')
        }
      })
      return false
    } else {
      throw Error('Not Implemented')
    }
  }
}

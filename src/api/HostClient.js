// -----------------------------------------------------------
// **HostClient**
// Responsible for managing and controlling MultiMC
// -----------------------------------------------------------
import path from 'path'
import fs, { readdirSync } from 'fs-extra'
import Instance from './Instance'
import AdmZip from 'adm-zip'
import { ipcRenderer } from 'electron'

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

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
   * @returns {Boolean} true or false
   */
  existsInstance (inst, method = 'folder') {
    const directories = getDirectories(this.instancePath)

    if (method === 'folder') {
      return directories.includes(inst)
    } else if (method === 'manifest.json') {
      for (const folder of directories) {
        const manifestPath = path.join(this.instancePath, folder, 'manifest.json')
        if (fs.existsSync(manifestPath)) {
          const manifest = require(path.resolve(manifestPath))
          if (manifest.name === inst) {
            return true
          }
        } else {
          console.error(manifestPath + ' does not exist')
        }
      }
      return false
    } else {
      throw Error('Not Implemented')
    }
  }

  /**
   * Gets list of instances on disk
   * Currently supports only manifest.json format
   * @returns {Instance[]} Instance array object
   */
  getInstances () {
    const directories = getDirectories(this.instancePath)
    const inst = []

    directories.forEach(element => {
      const manifestPath = path.join(this.instancePath, element, 'manifest.json')
      if (fs.existsSync(manifestPath)) {
        const manifest = require(path.resolve(manifestPath))
        const instFolder = path.join(this.instancePath, element)
        inst.push(new Instance(instFolder, manifest.name, manifest.version))
      }
    })
    return inst
  }

  /**
   * Downloads a new MutliMC instance and unzips it.
   * @param {Function} progressCallback Callback args gives progress object
   */
  createProcess (progressCallback = null, completeCallback = null) {
    if (process.platform === 'darwin') {
      const hostUrl = 'https://files.multimc.org/downloads/mmc-stable-osx64.tar.gz'

      ipcRenderer.send('download', { url: hostUrl, options: { directory: path.resolve(this.mainFolder) } })
    } else if (process.platform === 'win32') {
      const hostUrl = 'https://files.multimc.org/downloads/mmc-stable-win32.zip'
      const filePath = path.join(this.mainFolder, 'mmc-stable-win32.zip')

      ipcRenderer.send('download', { url: hostUrl, options: { directory: path.resolve(this.mainFolder) } })
      ipcRenderer.on('progress', (event, progress) => { progressCallback(progress) })
      ipcRenderer.on('complete', (event) => {
        console.log('here')
        const zip = new AdmZip(filePath)
        zip.extractAllTo(this.mainFolder)
        fs.removeSync(filePath)
        ipcRenderer.removeAllListeners('progress')
        ipcRenderer.removeAllListeners('complete')
        completeCallback()
      })
    } else {
      throw Error('Unsupported platform')
    }
  }
}

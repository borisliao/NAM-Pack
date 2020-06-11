// -----------------------------------------------------------
// **HostClient**
// Responsible for managing and controlling MultiMC
// -----------------------------------------------------------
import path from 'path'
import fs, { readdirSync } from 'fs-extra'
import axios from 'axios'
import AdmZip from 'adm-zip'
axios.defaults.adapter = require('axios/lib/adapters/http');

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

class Instance {
  constructor (folderPath, instName, instVersion) {
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
   * Only works in the browser!
   * @param {Function} progressCallback Callback args gives progress object
   * @returns Promise
   */
  createProcess (progressCallback = null) {
    let hostUrl
    if (process.platform === 'darwin') {
      hostUrl = 'https://files.multimc.org/downloads/mmc-stable-osx64.tar.gz'
    } else if (process.platform == 'win32') {
      hostUrl = 'https://files.multimc.org/downloads/mmc-stable-win32.zip'
    } else {
      throw Error('Unsupported platform')
    }

    return axios({
      method: 'get',
      url: hostUrl,
      responseType: 'stream'
    }, {
      onDownloadProgress: progressEvent => {
        progressCallback(progressEvent)
      }
    }
    ).then(function (response) {
      response.data.pipe(fs.createWriteStream('mmc-stable-win32.zip'))
    })
  }
}

// -----------------------------------------------------------
// **HostClient**
// Responsible for managing and controlling MultiMC
// -----------------------------------------------------------
import path from 'path'
import fs, { readdirSync } from 'fs-extra'
import Instance from './Instance'
import AdmZip from 'adm-zip'
import { ipcRenderer } from 'electron'
import { spawn } from 'child_process'
import 'regenerator-runtime/runtime.js'
import { createTwitch } from '../lib/mcm-dl/src/main'

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

function getFilenameFromUrl (url) {
  return url.substring(url.lastIndexOf('/') + 1)
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
      fs.mkdirSync(this.instancePath, {recursive: true})
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

  /**
   * Spawns a MultiMC instance
   *
   * Read https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
   * for args/option info
   * @param {[]} args
   * @param {{}} options
   * @returns {EventEmitter}
   */
  launch (args = [], options = {}) {
    const mc = spawn(this.executablePath, args, options)
    return mc
  }

  /**
   * Downloads and installs instances one by one
   * @param {Instance[]} instArray
   * @param {Function} progressCallback (progress:Progress)
   */
  async installInstances (instArray, progressCallback = null) {
    const mainProgress = { percent: 0, totalDownloaded: 0, total: instArray.length, state: 'initilized' }
    for (const index in instArray) {
      const dlurl = instArray[index].url
      const dlpath = path.resolve(this.mainFolder)

      const dlname = instArray[index].name
      const dlversion = instArray[index].version
      mainProgress.state = 'Getting initial zip file for ' + dlname + ' v' + dlversion
      const fileLocation = path.join(dlpath, getFilenameFromUrl(dlurl))

      const zipcb = function (progress) {
        console.log(progress)
        mainProgress.percent = progress.percent
        progressCallback(mainProgress)
      }

      // TODO : be more smart about updating old files and not just deleting them
      try {
        fs.rmdirSync(path.join(this.instancePath, dlname), { recursive: true })
      } catch (e) {
      }

      await this.dlIpc(dlurl, dlpath, zipcb)

      console.log(fileLocation)
      const modpack = createTwitch(fileLocation)

      await modpack.createMultiMC(this.instancePath, (progress) => {
        mainProgress.percent = progress.percent
        mainProgress.totalDownloaded = progress.totalDownloaded
        mainProgress.total = progress.total
        if (mainProgress.totalDownloaded === mainProgress.total - 1) {
          mainProgress.state = 'Post processing, this might take a while'
        } else {
          mainProgress.state = 'Downloading mods for ' + dlname + ' ' + mainProgress.totalDownloaded + '/' + mainProgress.total
        }
        progressCallback(mainProgress)
        console.log(mainProgress)
      })

      fs.remove(fileLocation)
    }
  }

  /**
   * Wrapper to download a file for electron ipc
   * **Cannot be run in parallel**
   */
  dlIpc (dlurl, dlpath, progressCallback = null) {
    const dlPromise = new Promise(function (resolve, reject) {
      ipcRenderer.send('download', { url: dlurl, options: { directory: dlpath } })
      ipcRenderer.on('progress', (event, progress) => { progressCallback(progress) })
      ipcRenderer.on('complete', (event) => {
        ipcRenderer.removeAllListeners('progress')
        ipcRenderer.removeAllListeners('complete')
        resolve(dlpath)
      })
    })
    return dlPromise
  }
}

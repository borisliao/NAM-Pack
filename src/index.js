import React, { forceUpdate } from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'
import HostClient from './api/HostClient'
import electron, { ipcRenderer } from 'electron'
import path from 'path'
import Remote from './api/Remote'
import fs from 'fs'

window.onload = async () => {
  const remote = new Remote()
  State.alert = await remote.getAlert()

  const mediaJson = await remote.getMedia().catch(error => console.error(error.message))
  fs.writeFileSync(path.join(workingPath, 'media.json'), JSON.stringify(mediaJson))

  ReactDOM.render(<App />, document.getElementById('app'))
}

// -----------------------------------------------------------
// App variables
// -----------------------------------------------------------

// Primary application state manager
const State = new StateAPI()
window.State = State

// TODO: change to process.env.APPDATA
const mainDir = electron.remote.app.getPath('userData')

let workingPath
if (process.platform === 'darwin') {
  workingPath = path.join(mainDir, 'process')
} else if (process.platform === 'win32') {
  workingPath = path.join(mainDir, 'process')
}

State.workingPath = workingPath

// -----------------------------------------------------------
// Main process event handlers
// -----------------------------------------------------------
ipcRenderer.on('latest', () => {
  State.latest = true
  checkHost()
})

// -----------------------------------------------------------
// App Tasks
// -----------------------------------------------------------
function readyLaunch () {
  State.loading = false
  State.status = 'Ready to play!'
  // TODO: FIX
  // Quick hack to force a render refresh on Info for first time launch
  State.selectedInstance = 1
  State.selectedInstance = 0
}

function checkForInstanceUpdates () {
  (async () => {
    State.status = 'Checking for pack updates'

    const remote = new Remote()

    const outOfDate = await remote.getOutOfDate(State.instances)
    if (outOfDate.length === 0) {
      readyLaunch()
    } else {
      await State.Host.installInstances(outOfDate, (mainProg) => {
        State.progress = mainProg.percent * 100
        State.status = mainProg.state
      })
      loadDiskInstances()
    }
  })()
}

function loadDiskInstances () {
  State.instances = State.Host.getInstances()
  checkForInstanceUpdates()
}

function checkHost () {
  State.Host = new HostClient(workingPath)
  if (!State.Host.exists()) {
    State.status = 'Downloading MultiMC'
    State.Host.createProcess((progress) => {
      State.progress = progress.percent * 100
      console.log(State.progress)
    }, () => {
      State.status = 'MultiMC download completed'
      State.progress = 0
      loadDiskInstances()
    })
  } else {
    State.status = 'Found MultiMC instance'
    loadDiskInstances()
  }
}

// -----------------------------------------------------------
// App Initiation
// -----------------------------------------------------------

State.status = 'Loading...'

// Check for application update if in production env
if (process.env.NODE_ENV !== 'test') {
  ipcRenderer.send('checkUpdate')
} else {
  State.latest = true
  State.status = 'DEV Mode: Auto update disabled'
  checkHost()
}

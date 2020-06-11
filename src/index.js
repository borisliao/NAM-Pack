import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'
import HostClient from './api/HostClient'
import electron, { ipcRenderer } from 'electron'
import path from 'path'

window.onload = () => {
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

function checkHost () {
  State.Host = new HostClient('./tests/')
  if (!State.Host.exists()) {
    State.Host.createProcess((progress) => {
      console.log(progress)
    })
  } else {
    State.status = 'Found MultiMC instance'
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

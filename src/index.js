import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'
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

const mainDir = electron.remote.app.getPath('userData')

let mcPath

// Check for existing MultiMC instance in userData
if (process.platform === 'darwin') {
  mcPath = path.join(mainDir, 'process', 'MultiMC.app')
} else if (process.platform === 'win32') {
  mcPath = path.join(mainDir, 'process', 'MultiMC')
}

// -----------------------------------------------------------
// Main process event handlers
// -----------------------------------------------------------
ipcRenderer.on('latest', () => { State.latest = true })

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
}

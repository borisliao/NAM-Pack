import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// Primary application state manager
const state = new StateAPI()
module.exports = state
state.status = 'Loading...'

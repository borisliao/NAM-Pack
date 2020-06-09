import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from '../src/api/State'

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// Primary application state manager
export const state = new StateAPI()

state.status = 'Loading...'

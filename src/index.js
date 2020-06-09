import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// Primary application state manager
const state = new StateAPI()
window.state1 = state
function tick () {
  console.log(window.state1)
  window.state1.status = new Date().toLocaleTimeString()
  setTimeout(tick, 1000)
}
setTimeout(tick, 1000)
state.status = 'Loading...'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import StateAPI from './api/StateAPI'

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// Primary application state manager
const State = new StateAPI()
window.State = State
function tick () {
  window.State.status = new Date().toLocaleTimeString()
  setTimeout(tick, 1000)
}
setTimeout(tick, 1000)
State.status = 'Loading...'

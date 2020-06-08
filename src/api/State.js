// -----------------------------------------------------------
// **State API**
// Keeps track of state in the lifecycle of the application
// Provides subscribers to frontend ./gui
// -----------------------------------------------------------

class StateAPI {
  constructor () {
    this._loading = true

    this._status = 'Initial Status'
    this._subscribeStatusFunct = []

    this._instance = null
    this._subscribeInstanceFunct = []
  }

  get loading () {
    return this._loading
  }

  set loading (loading) {
    this._loading = loading
  }

  get status () {
    return this._status
  }

  set status (status) {
    this._status = status
    this._subscribeStatusFunct.forEach(functArrayElem => {
      functArrayElem(status)
    })
  }

  subscribeStatus (funct) {
    this._subscribeStatusFunct.push(funct)
  }

  unsubscribeStatus (funct) {
    this._subscribeStatusFunct = this._subscribeStatusFunct.filter(functArrayElem => functArrayElem !== funct)
  }

  get instance () {
    return this._instance
  }

  set instance (instance) {
    this._instance = instance
    this._subscribeInstanceFunct.forEach(functArrayElem => {
      functArrayElem(instance)
    })
  }

  subscribeInstance (funct) {
    this._subscribeInstanceFunct.push(funct)
  }

  unsubscribeInstance (funct) {
    this._subscribeInstanceFunct = this._subscribeInstanceFunct.filter(functArrayElem => functArrayElem !== funct)
  }
}

export default StateAPI

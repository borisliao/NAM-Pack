// -----------------------------------------------------------
// **State API**
// Keeps track of state in the lifecycle of the application
// Provides subscribers to frontend ./gui
// -----------------------------------------------------------

class StateAPI {
  constructor () {
    this.latest = false

    this._loading = true
    this._subscribeLoadingFunct = []

    this._status = 'Initial Status'
    this._subscribeStatusFunct = []

    this._instance = null
    this._subscribeInstanceFunct = []
  }

  get loading () {
    return this._loading
  }

  set loading (loading) {
    // Allow change loading to true if this.latest (latest app version) is true
    if (this.latest) {
      this._loading = loading
    } else if (!this.latest && loading) {
      this._loading = loading
    } else {
      throw new Error('Unable to change loading: App is not on the latest version!')
    }
    this._subscribeLoadingFunct.forEach(functArrayElem => {
      functArrayElem(loading)
    })
  }

  subscribeLoading (funct) {
    this._subscribeLoadingFunct.push(funct)
  }

  unsubscribeLoading (funct) {
    this._subscribeLoadingFunct = this._subscribeLoadingFunct.filter(functArrayElem => functArrayElem !== funct)
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

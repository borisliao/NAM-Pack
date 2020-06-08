// -----------------------------------------------------------
// **State API**
// Keeps track of state in the lifecycle of the application
// Provides subscribers to frontend ./gui
// -----------------------------------------------------------

export default class StateAPI {
  constructor () {
    this.loading = true

    this.status = 'Initial Status'
    this.subscribeStatusFunct = []

    this.selectedInstance = null
    this.subscribeInstanceFunct = []
  }

  get loading () {
    return this.loading
  }

  setLoading (loading) {
    this.loading = loading
  }

  get status () {
    return this.status
  }

  setStatus (status) {
    this.status = status
    this.subscribeStatusFunct.array.forEach(functArrayElem => {
      functArrayElem(status)
    })
  }

  subscribeStatus (funct) {
    this.subscribeStatusFunct.push(funct)
  }

  unsubscribeStatus (funct) {
    this.subscribeStatusFunct = this.subscribeStatusFunct.filter(functArrayElem => !(funct))
  }

  get instance () {
    return this.instance
  }

  setInstance (instance) {
    this.instance = instance
    this.subscribeInstanceFunct.array.forEach(functArrayElem => {
      functArrayElem(instance)
    })
  }

  subscribeInstance (funct) {
    this.subscribeInstanceFunct = funct
  }

  unsubscribeInstance (funct) {
    this.subscribeInstanceFunct = this.subscribeInstanceFunct.filter(functArrayElem => !(funct))
  }
}

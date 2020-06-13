// -----------------------------------------------------------
// **State API**
// Keeps track of state in the lifecycle of the application
// Provides subscribers to frontend ./gui
// -----------------------------------------------------------

export default class StateAPI {
  constructor () {
    this.latest = false
    this.Host = null
    this.workingPath = null

    this._remoteMedia = {
      default: {
        title: 'NAM Client',
        description: 'World class launcher and auto updater for a world class server!',
        img: [
          'https://raw.githubusercontent.com/borisliao/NAM-Pack/master/docs/assets/img/logo.jpg'
        ]
      }
    }
    this._subscribeRemoteMediaFunct = []

    this._alert = null
    this._subscribeAlertFunct = []

    this._progress = 0
    this._subscribeProgressFunct = []

    this._loading = true
    this._subscribeLoadingFunct = []

    this._status = 'Initial Status'
    this._subscribeStatusFunct = []

    this._selectedInstance = 0
    this._subscribeSelectedInstanceFunct = []

    this._instances = null
    this._subscribeInstancesFunct = []
  }

  get selectedInstance () {
    return this._selectedInstance
  }

  set selectedInstance (selectedInstance) {
    this._selectedInstance = selectedInstance
    this._subscribeSelectedInstanceFunct.forEach(functArrayElem => {
      functArrayElem(selectedInstance)
    })
  }

  subscribeSelectedInstance (funct) {
    this._subscribeSelectedInstanceFunct.push(funct)
  }

  unsubscribeSelectedInstance (funct) {
    this._subscribeSelectedInstanceFunct = this._subscribeSelectedInstanceFunct.filter(functArrayElem => functArrayElem !== funct)
  }

  get remoteMedia () {
    return this._remoteMedia
  }

  set remoteMedia (remoteMedia) {
    this._remoteMedia = remoteMedia
    this._subscribeRemoteMediaFunct.forEach(functArrayElem => {
      functArrayElem(remoteMedia)
    })
  }

  subscribeRemoteMedia (funct) {
    this._subscribeRemoteMediaFunct.push(funct)
  }

  unsubscribeRemoteMedia (funct) {
    this._subscribeRemoteMediaFunct = this._subscribeRemoteMediaFunct.filter(functArrayElem => functArrayElem !== funct)
  }

  get alert () {
    return this._alert
  }

  set alert (alert) {
    this._alert = alert
    this._subscribeAlertFunct.forEach(functArrayElem => {
      functArrayElem(alert)
    })
  }

  subscribeAlert (funct) {
    this._subscribeAlertFunct.push(funct)
  }

  unsubscribeAlert (funct) {
    this._subscribeAlertFunct = this._subscribeAlertFunct.filter(functArrayElem => functArrayElem !== funct)
  }

  get progress () {
    return this._progress
  }

  set progress (progress) {
    this._progress = progress
    this._subscribeProgressFunct.forEach(functArrayElem => {
      functArrayElem(progress)
    })
  }

  subscribeProgress (funct) {
    this._subscribeProgressFunct.push(funct)
  }

  unsubscribeProgress (funct) {
    this._subscribeProgressFunct = this._subscribeProgressFunct.filter(functArrayElem => functArrayElem !== funct)
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

  get instances () {
    return this._instances
  }

  set instances (instances) {
    this._instances = instances
    this._subscribeInstancesFunct.forEach(functArrayElem => {
      functArrayElem(instances)
    })
  }

  subscribeInstances (funct) {
    this._subscribeInstancesFunct.push(funct)
  }

  unsubscribeInstances (funct) {
    this._subscribeInstancesFunct = this._subscribeInstancesFunct.filter(functArrayElem => functArrayElem !== funct)
  }
}

import Instance from './Instance'
import 'regenerator-runtime/runtime.js'

export default class Remote {
  async getOutOfDate (diskInstanceArray) {
    const remoteJson = await this.getProfile()
    const profiles = remoteJson.profiles
    const outOfDateArray = []

    console.log(profiles)
    for (const remoteInst of Object.entries(profiles)) {
      let outOfDate = true
      const remoteName = remoteInst[0]
      const remoteVersion = remoteInst[1].version
      const remoteUrl = remoteInst[1].url
      const remoteType = remoteInst[1].type

      for (const diskInst of diskInstanceArray) {
        if (diskInst.name === remoteName && diskInst.version === remoteVersion) {
          outOfDate = false
          break
        }
      }

      if (outOfDate) {
        const updateInstanceInfo = new Instance('remote', remoteName, remoteVersion, remoteUrl, remoteType)
        outOfDateArray.push(updateInstanceInfo)
      }
    }
    return outOfDateArray
  }

  async getInstances () {
    const remoteJson = await this.getProfile()
    const profiles = remoteJson.profiles
    const instArray = []
    for (const name of remoteJson.list) {
      const inst = new Instance('remote', name, profiles[name].version)
      instArray.push(inst)
    }
    return instArray
  }

  async getProfile () {
    class HTTPError extends Error {}

    const response = await fetch('https://cdn.jsdelivr.net/gh/borisliao/nam-dist@master/profiles.json', {
      method: 'GET'
    })

    if (!response.ok) {
      throw new HTTPError('Fetch error:', response.statusText)
    }

    const parsed = await response.json()

    return parsed
  }
}

import HostClient from '../src/api/HostClient'
import fs from 'fs-extra'

test('mainFolder is ./', () => {
  const Host = new HostClient('./')
  expect(Host.mainFolder).toBe('./')
})

test('exists() returns false', () => {
  const Host = new HostClient('./')
  expect(Host.exists()).toBe(false)
})

test('existsInstance finds NAM Pack, method: folder', () => {
  const Host = new HostClient('./tests/process/')
  const x = Host.existsInstance('NAM Pack', 'folder')
  expect(x).toBe(true)
})

test('existsInstance doesnt find NAM Pack, method: manifest.json', () => {
  const Host = new HostClient('./tests/process/')
  const x = Host.existsInstance('NAM Pack', 'manifest.json')
  expect(x).toBe(false)
})

test('existsInstance find NAM Pack 2020, method: manifest.json', () => {
  const Host = new HostClient('./tests/process/')
  const x = Host.existsInstance('NAM Pack 2020', 'manifest.json')
  expect(x).toBe(true)
})

test('getInstance gets all the instances', () => {
  const Host = new HostClient('./tests/process/')
  const x = Host.getInstances()
  expect(x.length).toBe(2)
  expect(x[0].name).toBe('NAM Pack 2020')
  expect(x[0].version).toBe('5.0.2')
  expect(x[0].folder).toBe('tests\\process\\MultiMC\\instances\\NAM Pack')
  expect(x[1].name).toBe('Vanilla')
  expect(x[1].version).toBe('5.0.1')
  expect(x[1].folder).toBe('tests\\process\\MultiMC\\instances\\Vanilla')
})

test('createProcess creates a MultiMC executable', async () => {
  const Host = new HostClient('./tests/')
  let count = null
  const cb = (progressObj) => {
    count = progressObj
  }
  await Host.createProcess(cb)
  expect(count.percent).toBe(1)
  expect(Host.exists()).toBe(true)
  fs.remove('tests/MultiMC/')
  fs.remove('mmc-stable-win32.zip')
})

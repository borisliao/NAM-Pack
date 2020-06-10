import HostClient from '../src/api/HostClient'

test('loading initial state is true', () => {
  const Host = new HostClient('./')
  expect(Host.mainFolder).toBe('./')
})

import StateAPI from '../src/api/StateAPI'

test('loading initial state is true', () => {
  const state = new StateAPI()
  expect(state.loading).toBe(true)
})

test('loading can change state to false', () => {
  const state = new StateAPI()
  state.latest = true
  state.loading = false
  expect(state.loading).toBe(false)
})

test('status initial state is Initial Status', () => {
  const state = new StateAPI()
  expect(state.status).toBe('Initial Status')
})

test('status state changes', () => {
  const state = new StateAPI()
  state.status = 'not Initial Status'
  expect(state.status).toBe('not Initial Status')
})

test('status calls subscribed listener with right status', () => {
  const state = new StateAPI()
  let calls = 0
  state.subscribeStatus((status) => {
    expect(status).toBe('changed')
    calls++
  })
  expect(state.status).toBe('Initial Status')
  state.status = 'changed'
  expect(calls).toBe(1)
})

test('status calls multiple subscribed listeners', () => {
  const state = new StateAPI()
  let calls = 0
  let secondCaller = 0
  state.subscribeStatus((status) => {
    expect(status).toBe('changed')
    calls++
  })

  state.subscribeStatus((status) => {
    expect(status).toBe('changed')
    calls++
    secondCaller++
  })
  expect(state.status).toBe('Initial Status')
  state.status = 'changed'
  expect(calls).toBe(2)
  expect(secondCaller).toBe(1)
})

test('status removes state and does not call them again', () => {
  const state = new StateAPI()
  let calls = 0
  let secondCaller = 0
  const funct1 = (status) => {
    calls++
  }
  state.subscribeStatus(funct1)

  state.subscribeStatus((status) => {
    calls++
    secondCaller++
  })
  expect(state.status).toBe('Initial Status')
  state.status = 'changed'
  expect(calls).toBe(2)
  expect(secondCaller).toBe(1)

  state.unsubscribeStatus(funct1)
  state.status = 'changed2'
  expect(state.status).toBe('changed2')
  expect(calls).toBe(3)
  expect(secondCaller).toBe(2)
})

test('instance initial state is Initial instance', () => {
  const state = new StateAPI()
  expect(state.instance).toBeNull()
})

test('instance state changes', () => {
  const state = new StateAPI()
  state.instance = 'not Initial instance'
  expect(state.instance).toBe('not Initial instance')
})

test('instance calls subscribed listener with right instance', () => {
  const state = new StateAPI()
  let calls = 0
  state.subscribeInstance((instance) => {
    expect(instance).toBe('changed')
    calls++
  })
  expect(state.instance).toBeNull()
  state.instance = 'changed'
  expect(calls).toBe(1)
})

test('instance calls multiple subscribed listeners', () => {
  const state = new StateAPI()
  let calls = 0
  let secondCaller = 0
  state.subscribeInstance((instance) => {
    expect(instance).toBe('changed')
    calls++
  })

  state.subscribeInstance((instance) => {
    expect(instance).toBe('changed')
    calls++
    secondCaller++
  })
  expect(state.instance).toBeNull()
  state.instance = 'changed'
  expect(calls).toBe(2)
  expect(secondCaller).toBe(1)
})

test('instance removes state and does not call them again', () => {
  const state = new StateAPI()
  let calls = 0
  let secondCaller = 0
  const funct1 = (instance) => {
    calls++
  }
  state.subscribeInstance(funct1)

  state.subscribeInstance((instance) => {
    calls++
    secondCaller++
  })
  expect(state.instance).toBeNull()
  state.instance = 'changed'
  expect(calls).toBe(2)
  expect(secondCaller).toBe(1)

  state.unsubscribeInstance(funct1)
  state.instance = 'changed2'
  expect(state.instance).toBe('changed2')
  expect(calls).toBe(3)
  expect(secondCaller).toBe(2)
})
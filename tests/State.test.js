import StateAPI from '../src/api/State'

test('loading initial state is true', () => {
  const state = new StateAPI()
  expect(state.loading === true)
})

test('loading can change state to false', () => {
  const state = new StateAPI()
  state.loading = false
  expect(state.loading === false)
})

test('status initial state is Initial Status', () => {
  const state = new StateAPI()
  expect(state.status === 'Initial Status')
})

test('status state changes', () => {
  const state = new StateAPI()
  console.log(state._subscribeStatusFunct)
  state.status = 'not Initial Status'
  expect(state.status === 'not Initial Status')
})

test('status calls subscribed listener with right status', () => {
  const state = new StateAPI()
  let calls = 0
  state.subscribeStatus((status) => {
    expect(status === 'Initial Status')
    calls++
  })
  expect(state.status === 'Initial Status')
  expect(calls === 1)
})

test('status calls multiple subscribed listeners', () => {
  const state = new StateAPI()
  let calls = 0
  let secondCaller = 0
  state.subscribeStatus((status) => {
    expect(status === 'Initial Status')
    calls++
  })

  state.subscribeStatus((status) => {
    expect(status === 'Initial Status')
    calls++
    secondCaller++
  })
  expect(state.status === 'Initial Status')
  expect(calls === 2)
  expect(secondCaller === 1)
})

import React, { useState, useEffect } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Spinner from 'react-bootstrap/Spinner'
import { Container } from 'react-bootstrap'
import { ipcRenderer } from 'electron'

export default function Selector () {
  const [loading, setLoading] = useState(true)
  const [instances, setInstances] = useState(null)
  const [selected, setSelected] = useState(0)
  const State = window.State

  useEffect(() => {
    function selectorHandleLoadingChange (loading) {
      setLoading(State.loading)
    }

    function selectorHandleInstancesChange (loading) {
      setInstances(State.instances)
    }

    State.subscribeLoading(selectorHandleLoadingChange)
    State.subscribeInstances(selectorHandleInstancesChange)

    selectorHandleLoadingChange()
    selectorHandleInstancesChange()

    return function cleanup () {
      State.unsubscribeLoading(selectorHandleLoadingChange)
      State.unsubscribeInstances(selectorHandleInstancesChange)
    }
  })

  function changeInstance (index) {
    State.selectedInstance = index
    setSelected(index)
  }

  function runMutliMCDetached () {
    const mc = State.Host.launch(['-l', instances[selected].name], {
      detached: true,
      stdio: 'ignore'
    })
    mc.on('close', (code) => { State.loading = false })
    State.loading = true
    ipcRenderer.send('close')
  }

  return (
    <Container>
      <ButtonGroup>
        <Button variant="primary" disabled={loading} onClick={e => { runMutliMCDetached() }}>
          {loading &&
            <Spinner
              animation="border"
              size="sm"
            />}
          Play
        </Button>
        {instances && <DropdownButton id="dropdown-basic-button" title={instances[selected].name}>
          {instances.map((inst, index) => {
            return <Dropdown.Item key={inst.name} onClick={e => { changeInstance(index) }}>{inst.name} <i>{' (v' + inst.version + ')'}</i></Dropdown.Item>
          })}
        </DropdownButton>}
      </ButtonGroup>
    </Container>
  )
}

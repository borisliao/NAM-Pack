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
    // TODO change State.loading to function args 'loading'
    function selectorHandleLoadingChange (loading) {
      setLoading(State.loading)
    }

    function selectorHandleInstancesChange (loading) {
      setInstances(State.instances)
    }

    function selectorHandleSelectedInstanceChange (loading) {
      setSelected(State.selectedInstance)
    }

    State.subscribeLoading(selectorHandleLoadingChange)
    State.subscribeInstances(selectorHandleInstancesChange)
    State.subscribeSelectedInstance(selectorHandleSelectedInstanceChange)

    selectorHandleLoadingChange()
    selectorHandleInstancesChange()
    selectorHandleSelectedInstanceChange()

    return function cleanup () {
      State.unsubscribeLoading(selectorHandleLoadingChange)
      State.unsubscribeInstances(selectorHandleInstancesChange)
      State.unsubscribeSelectedInstance(selectorHandleSelectedInstanceChange)
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

  let dropdown = null
  const selections = []
  if (Array.isArray(instances) && instances.length) {
    for (const index in instances) {
      const instanceName = instances[index].name
      const instanceVersion = instances[index].version
      const nameVersion = instanceName + ' (v' + instanceVersion + ')'
      selections.push(<Dropdown.Item key={nameVersion} onClick={e => { changeInstance(index) }}>{instanceName} <i>{' (v' + instanceVersion + ')'}</i></Dropdown.Item>)
    }
    dropdown = <DropdownButton id="dropdown-basic-button" title={instances[selected].name}>{selections}</DropdownButton>
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
        {dropdown}
      </ButtonGroup>
    </Container>
  )
}

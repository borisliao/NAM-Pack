import React, { useState, useEffect } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Spinner from 'react-bootstrap/Spinner'
import { Container } from 'react-bootstrap'

export default function Selector () {
  const [loading, setLoading] = useState(true)
  const State = window.State

  useEffect(() => {
    function selectorHandleLoadingChange (loading) {
      setLoading(State.loading)
    }

    State.subscribeLoading(selectorHandleLoadingChange)

    selectorHandleLoadingChange()

    return function cleanup () {
      State.unsubscribeLoading(selectorHandleLoadingChange)
    }
  })

  return (
    <Container>
      <ButtonGroup>
        <Button variant="primary" disabled={loading}>
          {loading &&
            <Spinner
              animation="border"
              size="sm"
            />}
          Play
        </Button>
        <DropdownButton id="dropdown-basic-button" title="Dropdown button">
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
      </ButtonGroup>
    </Container>
  )
}

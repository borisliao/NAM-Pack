import React, { useState, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Navbar from 'react-bootstrap/Navbar'
import { Container, Col } from 'react-bootstrap'

export default function NavbarStatus () {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Starting application')
  const State = window.State

  useEffect(() => {
    function handleStatusChange (status) {
      setStatus(State.status)
    }

    function handleLoadingChange (loading) {
      setLoading(State.loading)
    }

    State.subscribeStatus(handleStatusChange)
    State.subscribeLoading(handleLoadingChange)

    handleStatusChange()
    handleLoadingChange()

    return function cleanup () {
      State.unsubscribeStatus(handleStatusChange)
      State.unsubscribeLoading(handleLoadingChange)
    }
  })

  return (
    <Navbar.Text>
      <Container>
        {status}
        {loading &&
          <Col><Spinner animation="border" size="sm" /></Col>
        }
      </Container>
    </Navbar.Text>
  )
};

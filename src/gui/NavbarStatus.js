import React, { useState, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Navbar from 'react-bootstrap/Navbar'
import { Container, Col } from 'react-bootstrap'

export default function NavbarStatus () {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Starting application')
  const State = window.State

  useEffect(() => {
    function navbarHandleStatusChange (status) {
      setStatus(State.status)
    }

    function navbarHandleLoadingChange (loading) {
      setLoading(State.loading)
    }

    State.subscribeStatus(navbarHandleStatusChange)
    State.subscribeLoading(navbarHandleLoadingChange)

    navbarHandleStatusChange()
    navbarHandleLoadingChange()

    return function cleanup () {
      State.unsubscribeStatus(navbarHandleStatusChange)
      State.unsubscribeLoading(navbarHandleLoadingChange)
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

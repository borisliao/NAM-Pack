import React, { useState, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Navbar from 'react-bootstrap/Navbar'
import { Container, Col } from 'react-bootstrap'
import ProgressBar from 'react-bootstrap/ProgressBar'

export default function NavbarStatus () {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Starting application')
  const [progress, setProgress] = useState(0)
  const State = window.State
  let progressBar

  useEffect(() => {
    function navbarHandleStatusChange (status) {
      setStatus(State.status)
    }

    function navbarHandleLoadingChange (loading) {
      setLoading(State.loading)
    }

    function navbarHandleProgressChange (loading) {
      // If progress == 100, reset back to 0
      if (State.progress !== 100) {
        setProgress(State.progress)
      } else {
        setProgress(0)
      }
    }

    State.subscribeStatus(navbarHandleStatusChange)
    State.subscribeLoading(navbarHandleLoadingChange)
    State.subscribeProgress(navbarHandleProgressChange)

    navbarHandleStatusChange()
    navbarHandleLoadingChange()
    navbarHandleProgressChange()

    return function cleanup () {
      State.unsubscribeStatus(navbarHandleStatusChange)
      State.unsubscribeLoading(navbarHandleLoadingChange)
      State.unsubscribeProgress(navbarHandleProgressChange)
    }
  })

  if (progress !== 0) {
    progressBar = <ProgressBar now={progress} />
  } else {
    progressBar = null
  }

  return (
    <Navbar.Text>
      {progressBar}
      <Container>
        {status}
        {loading &&
          <Col><Spinner animation="border" size="sm" /></Col>
        }
      </Container>
    </Navbar.Text>
  )
};

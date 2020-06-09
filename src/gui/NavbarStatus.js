import React, { useState, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Navbar from 'react-bootstrap/Navbar'
import { Container, Col } from 'react-bootstrap'
import state from '../index'
const { ipcRenderer } = require('electron')

export default function NavbarStatus () {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Starting application')
  useEffect(() => {
    console.log('start')
    setStatus(ipcRenderer.sendSync('synchronous-message', 'ping'))
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

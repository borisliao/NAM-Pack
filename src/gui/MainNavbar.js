import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Spinner from 'react-bootstrap/Spinner'
import { Container, Col } from 'react-bootstrap'

const appVersion = window.require('electron').remote.app.getVersion()

export default function MainNavbar () {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#home"> NAM Pack </Navbar.Brand>
      <Navbar.Text><em> v{appVersion} </em></Navbar.Text>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          <Container>
            Checking for Updates
            <Col><Spinner animation="border" size="sm" /></Col>
          </Container>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
};

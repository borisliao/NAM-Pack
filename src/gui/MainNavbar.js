import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Spinner from 'react-bootstrap/Spinner'

const appVersion = window.require('electron').remote.app.getVersion()

export default function MainNavbar () {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#home"> NAM Pack </Navbar.Brand>
      <Navbar.Text><em> v{appVersion} </em></Navbar.Text>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          Checking for Updates
          <Spinner animation="border" size="sm" />
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
};

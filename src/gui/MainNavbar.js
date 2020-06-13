import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import NavbarStatus from './NavbarStatus.js'

const appVersion = window.require('electron').remote.app.getVersion()

export default function MainNavbar () {
  return (
    <Navbar bg="light">
      <Navbar.Brand> NAM Pack </Navbar.Brand>
      <Navbar.Text><em> v{appVersion} </em></Navbar.Text>
      <Navbar.Collapse className="justify-content-end">
        <NavbarStatus />
      </Navbar.Collapse>
    </Navbar>
  )
};

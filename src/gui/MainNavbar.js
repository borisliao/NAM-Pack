import React, { useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'

const appVersion = window.require('electron').remote.app.getVersion()

export default function MainNavbar () {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#home">
        NAM Pack
      </Navbar.Brand>
      <Navbar.Text><em>v{appVersion}</em></Navbar.Text>
    </Navbar>
  )
};

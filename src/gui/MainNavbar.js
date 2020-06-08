import React, { useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'

export default function MainNavbar () {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#home">
        NAM Pack
      </Navbar.Brand>
      <Navbar.Text><em>v0.0.1</em></Navbar.Text>
    </Navbar>
  )
};

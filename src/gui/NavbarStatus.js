import React from 'react'
import Spinner from 'react-bootstrap/Spinner'
import Navbar from 'react-bootstrap/Navbar'
import { Container, Col } from 'react-bootstrap'

export default function NavbarStatus () {
  return (
    <Navbar.Text>
      <Container>
        Checking for Updates
        <Col><Spinner animation="border" size="sm" /></Col>
      </Container>
    </Navbar.Text>
  )
};

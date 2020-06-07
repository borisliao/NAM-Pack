import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar'

export default class MainNavbar extends Component {
    constructor(props) {
      super(props);
      this.state = {date: new Date()};
    }
    render() {
      return(
        <Navbar bg="light">
          <Navbar.Brand href="#home">
            NAM Pack
          </Navbar.Brand>
          <Navbar.Text><em>v0.0.1{this.state.date.toLocaleTimeString()}</em></Navbar.Text>
        </Navbar>
      );
    }
};
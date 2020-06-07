import React, { Component } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron'
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './gui/MainNavbar';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
      }
      
    componentDidMount() {
        this.timerID = setInterval(
        () => this.tick(),
        1000
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    
    tick() {
        this.setState({
        date: new Date()
        });
    }
    render() {
        return (
        <Navbar />
    );}
}
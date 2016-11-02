'use strict';

import React, {Component} from 'react';
import request  from 'superagent';

import Login from './Login'

export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            token: null,
            query: null,
            items: []
        };

        this.setToken = this.setToken.bind(this)
    }

    setToken(token) {
        this.setState({
            token: token
        })
    }

    render() {
        var render;
        if (this.state.token) {
            render = <div>Yolo</div>
        } else
            render = <Login onSuccess={this.setToken}></Login>
        return <section>{render}</section>
    }
}






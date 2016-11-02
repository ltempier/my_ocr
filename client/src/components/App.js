'use strict';

import React, {Component} from 'react';
import request  from 'superagent';
import {connect} from 'react-redux'
import {searchItems} from '../actions/items'

import Login from './Login'

class App extends Component {

    constructor(props) {
        super(props);
        this.setToken = this.setToken.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this)
    }

    handleSearchChange(e) {
        const {dispatch} = this.props;
        dispatch(searchItems(e.target.value))
    }

    setToken(token) {
        console.log(token);
        this.setState({
            token: token
        })
    }

    render() {

        console.log(this.props)

        var render;
        render = (
            <div>
                <input type="text" onChange={this.handleSearchChange}/>
                <p>{this.props.isLoading}</p>
            </div>
        )
        //} else
        //    render = <Login onSuccess={this.setToken}></Login>;

        return <section>{render}</section>
    }
}

export default connect((state) => {
    return {
        data: state.items,
        //isLoading: state.isLoading
    }
})(App)


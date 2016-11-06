'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux'

import {searchItems} from '../actions/items'

import Login from './Login'
import SearchBar from './SearchBar'
import ListItem from './ListItem'

class App extends Component {

    constructor(props) {
        super(props);
        this.handleSearchChange = this.handleSearchChange.bind(this)
    }

    handleSearchChange(e) {
        const {dispatch} = this.props;
        dispatch(searchItems(e.target.value))
    }

    render() {
        if (this.props.token)
            return (
                <section className="container">
                    <SearchBar></SearchBar>
                    <ListItem></ListItem>
                </section>
            );
        else
            return (
                <section className="container">
                    <Login></Login>
                </section>
            );

    }
}

export default connect((state) => {
    return {
        token: state.login.token
    }
})(App)


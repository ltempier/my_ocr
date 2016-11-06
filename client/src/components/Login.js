'use strict';

import React, {Component} from 'react';

import {connect} from 'react-redux'
import {login} from '../actions/login'

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            login: "admin",
            password: "password",
            messageErrorText: null,
            loginErrorText: null,
            passwordErrorText: null
        };

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    handleLoginChange(e) {
        this.setState({
            login: e.target.value,
            loginErrorText: null,
            messageErrorText: null
        });
    }

    handlePasswordChange(e) {
        this.setState({
            password: e.target.value,
            passwordErrorText: null,
            messageErrorText: null
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        var valid = true;
        if (this.state.login.length < 1) {
            valid = false;
            this.setState({loginErrorText: "This field is required"});
        }
        if (this.state.password.length < 1) {
            valid = false;
            this.setState({passwordErrorText: "This field is required"});
        }
        if (valid) {
            const {dispatch} = this.props;
            dispatch(login(this.state.login, this.state.password))
        }

    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="form-horizontal">
                <div className="form-group">
                    <label className="col-lg-2 control-label">Login</label>
                    <div className="col-lg-10">
                        <input type="text" className="form-control" name="login" value={this.state.login}
                               onChange={this.handleLoginChange}/>
                    </div>
                    <p>
                        {this.state.loginErrorText}
                    </p>
                </div>
                <div className="form-group">
                    <label className="col-lg-2 control-label">Password</label>
                    <div className="col-lg-10">
                        <input type="password" className="form-control" name="pwd" value={this.state.password}
                               onChange={this.handlePasswordChange}/>
                    </div>
                    <p>
                        {this.state.passwordErrorText}
                    </p>
                </div>
                <p>
                    {this.state.messageErrorText}
                </p>
                <div className="form-group">
                    <div className="col-lg-10 col-lg-offset-2">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
        )
    }
}

export default connect((state) => {
    return state.items
})(Login)


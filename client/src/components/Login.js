'use strict';

import React, {Component} from 'react';
import request  from 'superagent';

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            login: "",
            password: "",
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
            this.setState({loading: true});
            request
                .post('/auth')
                .send({
                    login: this.state.login,
                    password: this.state.password
                })
                .set('Accept', 'application/json')
                .end((err, res)=> {
                    this.setState({loading: false});
                    if (err) {
                        if (res && res.body && res.body.message)
                            this.setState({messageErrorText: res.body.message});
                    } else
                        this.props.onSuccess(res.body.token)
                });
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
                </div>
                <div className="form-group">
                    <label className="col-lg-2 control-label">Password</label>

                    <div className="col-lg-10">
                        <input type="password" className="form-control" name="pwd" value={this.state.password}
                               onChange={this.handlePasswordChange}/>
                    </div>
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

Login.defaultProps = {
    onSuccess: function (token) {
        console.log('token', token)
    }
};




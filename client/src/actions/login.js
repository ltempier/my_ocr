"use strict";

import * as types from './../constants/ActionTypes'
import request  from 'superagent';

export function login(login, password) {

    return (dispatch) => {
        dispatch({type: types.LOGIN});
        return request
            .post('/auth')
            .send({
                login: login,
                password: password
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err)
                    dispatch({type: types.LOGIN_ERROR, messageErrorText: err.message});
                else if (res && res.body && res.body.token) {
                    window.localStorage.token = res.body.token;
                    dispatch({type: types.LOGIN_SUCCESS, token: res.body.token});
                } else
                    dispatch({type: types.LOGIN_ERROR});
            });
    }
}

export function logout() {
    return (dispatch) => {
        localStorage.removeItem('token');
        dispatch({type: types.LOGOUT});
    }
}



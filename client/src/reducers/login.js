"use strict";

import * as types from './../constants/ActionTypes'

export default function media(state = {token: window.localStorage.token, isLoading: false}, action) {
    switch (action.type) {
        case types.LOGIN:
            return Object.assign({}, state, {isLoading: true});

        case types.LOGOUT:
            return Object.assign({}, state, {token: null});

        case types.LOGIN_SUCCESS:
            return Object.assign({}, state, {isLoading: false, token: action.token});

        case types.LOGIN_ERROR:
            return Object.assign({}, state, {messageErrorText: action.messageErrorText, isLoading: false});

        default:
            return state
    }
}
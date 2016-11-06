"use strict";

import * as types from './../constants/ActionTypes'

export default function media(state = {data: [], isLoading: false}, action) {
    switch (action.type) {
        case types.SEARCH_ITEMS:
            return Object.assign({}, state, {isLoading: true});

        case types.SEARCH_ITEMS_SUCCESS:
            return Object.assign({}, state, {data: action.data, isLoading: false});

        case types.SEARCH_ITEMS_ERROR:
            return Object.assign({}, state, {error: action.error, isLoading: false});

        default:
            return state
    }
}
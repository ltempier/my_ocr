"use strict";

import * as types from './../constants/ActionTypes'

export default function media(state = {items: [], isLoading: false}, action) {
    switch (action.type) {
        case types.SEARCH_ITEMS:
            return Object.assign({}, state, {isLoading: true});

        case types.SEARCH_ITEMS_SUCCESS:
            return Object.assign({}, state, {items: action.items, isLoading: false});

        default:
            return state
    }
}
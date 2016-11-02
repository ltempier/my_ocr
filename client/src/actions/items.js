"use strict";

import * as types from './../constants/ActionTypes'

export function searchItems(query) {

    const token = 'eyJhbGciOiJIUzI1NiJ9.dHJ1ZQ.UdeRjuAXdhUrKin8MJFYmOR20JAqWB3o61tXjpSoOhw'
    const url = `/api/search?token=${token}&q=${query}`;

    return (dispatch) => {

        dispatch({type: types.SEARCH_ITEMS})

        return fetch(url, {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                dispatch({type: types.SEARCH_ITEMS_SUCCESS, items: json});
            })
            .catch(error => {
                console.error(error)
                dispatch({type: types.SEARCH_ITEMS_ERROR, error: error});
            })
    }
}

export function searchItems2(query) {

    const token = 'eyJhbGciOiJIUzI1NiJ9.dHJ1ZQ.UdeRjuAXdhUrKin8MJFYmOR20JAqWB3o61tXjpSoOhw'
    const url = `/api/search?token=${token}&q=${query}`;

    return (dispatch) => {

        dispatch({type: types.SEARCH_ITEMS})

        return fetch(url, {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                dispatch({type: types.SEARCH_ITEMS_SUCCESS, items: json});
            })
            .catch(error => {
                console.error(error)
                dispatch({type: types.SEARCH_ITEMS_ERROR, error: error});
            })
    }
}

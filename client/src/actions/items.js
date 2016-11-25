"use strict";

import * as types from './../constants/ActionTypes'
import request  from 'superagent';

var oldQuery = "";

export function searchItems(query) {
    oldQuery = query;
    return (dispatch, getState) => {
        const token = getState().login.token,
            url = `/api/search?q=${query}`;

        dispatch({type: types.SEARCH_ITEMS});
        return request
            .get(url)
            .set('x-access-token', token)
            .end(function (err, res) {
                if (err)
                    dispatch({type: types.SEARCH_ITEMS_ERROR, error: err.message});
                else
                    dispatch({type: types.SEARCH_ITEMS_SUCCESS, data: res.body || []});
            });
    }
}

export function reload(timeout = 1000) {
    return (dispatch) => {
        dispatch({type: types.SEARCH_ITEMS});
        setTimeout(function () {
            console.log("refresh");
            dispatch(searchItems(oldQuery))
        }, timeout)
    }
}

export function upload(obj) {
    return (dispatch, getState) => {
        const token = getState().login.token;

        dispatch({type: types.UPLOADING});

        var formData = new FormData();
        obj.files.forEach(function (file) {
            formData.append('file', file, file.name);
        });

        return request
            .post('/api/files')
            .set('x-access-token', token)
            .send(formData)
            .end(function (err, res) {
                if (err)
                    dispatch({type: types.UPLOAD_ERROR, error: err.message});
                else {
                    dispatch({type: types.UPLOAD_SUCCESS});
                    dispatch(reload())
                }
            });
    }
}

export function remove(url) {
    return (dispatch, getState) => {
        const token = getState().login.token;

        dispatch({type: types.REMOVING});
        return request
            .delete(url)
            .set('x-access-token', token)
            .end(function (err, res) {
                if (err)
                    dispatch({type: types.REMOVE_ERROR, error: err.message});
                else {
                    dispatch({type: types.REMOVE_SUCCESS});
                    dispatch(reload())
                }
            });
    }
}





"use strict";

import * as types from './../constants/ActionTypes'
import request  from 'superagent';

export function searchItems(query) {

    return (dispatch, getState) => {
        const token = getState().login.token;
        const url = `/api/search?q=${query}`;

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


export function upload(obj) {


    console.log(obj);

    return (dispatch, getState) => {
        const token = getState().login.token;

        dispatch({type: types.UPLOAD});

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
                else
                    dispatch({type: types.UPLOAD_SUCCESS});
            });
    }
}




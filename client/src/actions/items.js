"use strict";

import * as types from './../constants/ActionTypes'
import request  from 'superagent';

export function searchItems(query) {

    return (dispatch, getState) => {
        const token = getState().login.token;
        const url = `/api/search?token=${token}&q=${query}`;

        dispatch({type: types.SEARCH_ITEMS});
        return request.get(url)
            .end(function (err, res) {

                if (err)
                    dispatch({type: types.SEARCH_ITEMS_ERROR, error: err.message});
                else
                    dispatch({type: types.SEARCH_ITEMS_SUCCESS, data: res.body || []});
            });
    }
}




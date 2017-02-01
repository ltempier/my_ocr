'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux'
import {remove} from '../actions/items'

class ListItem extends Component {

    constructor(props) {
        super(props);
        this.textMaxLength = 500;
    }


    render() {
        var items = this.props.data.map((item, idx) => {
            if (!item)
                return;

            let text = (item.text && item.text.length && item.text.length > this.textMaxLength) ? item.text.substring(0, this.textMaxLength) + ' ...' : item.text;
            let fileUrl = (item.file && item.file.url ) ? (item.file.url + "?token=" + this.props.token) : '/static/404.gif';
            return (
                <div key={idx} className="row">
                    <div className="col-lg-12">
                        <div className="panel panel-default">
                            <div className="panel-body">
                                <button type="button" className="close" aria-hidden="true"
                                        onClick={() => this.props.dispatch(remove(item.id))}>&times;</button>
                                <div className="row">
                                    <div className="col-lg-3 col-md-6 col-xs-12">
                                        <img src={fileUrl}/>
                                    </div>
                                    <div className="col-lg-9 col-md-6 col-xs-12">
                                        <p>{text}</p>
                                        { item.file ?
                                            <a href={fileUrl} target="_blank">{item.file.fileName}</a> : 'no file'}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )
        });
        return (<div>{items}</div>)
    }
}

export default connect((state) => {
    return {
        data: state.items.data,
        token: state.login.token
    }
})(ListItem)


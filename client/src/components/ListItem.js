'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux'

class ListItem extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        var items = this.props.data.map((item, idx) => {
            let fileUrl = item.file.url + "?token=" + this.props.token;
            return (
                <div key={idx} className="row">
                    <div className="col-lg-12">
                        <div className="panel panel-default">
                            <div className="panel-body">
                                <button type="button" className="close" aria-hidden="true">&times;</button>
                                <div className="row">
                                    <div className="col-lg-3 col-md-6 col-xs-12">
                                        <img src={fileUrl}/>
                                    </div>
                                    <div className="col-lg-9 col-md-6 col-xs-12">
                                        <p>{item.text}</p>
                                        <a href={fileUrl} target="_blank">{item.file.fileName}</a>
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


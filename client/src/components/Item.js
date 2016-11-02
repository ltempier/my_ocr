'use strict';

import React, {Component} from 'react';
import request  from 'superagent';

export default class Item extends Component {

    constructor(props) {
        super(props);
    }


    render() {


        return (
            <div>

                <img src={this.props.file.url}/>
                <p>{this.text}</p>
                <a href={this.props.file.url} ></a>
            </div>
        )

    }

}


Item.defaultProps = {
    date: null,
    file: {},
    process: null,
    tags: [],
    text: "",
    user: {}
};




'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux'
import {searchItems} from '../actions/items'


class SearchBar extends Component {

    constructor(props) {
        super(props);
        this.handleSearchChange = this.handleSearchChange.bind(this);

        const {dispatch} = this.props;
        dispatch(searchItems(""))
    }

    handleSearchChange(e) {
        const {dispatch} = this.props;
        dispatch(searchItems(e.target.value))
    }

    render() {
        return (
            <div>
                <div className="page-header">
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search"
                               onChange={this.handleSearchChange}/>

                    <span className="input-group-btn">
                            <button className="btn btn-default" type="button">Upload</button>
                    </span>
                    </div>
                </div>


                <div className="modal">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close"
                                        aria-hidden="true">&times;</button>
                                <h4 className="modal-title">Modal title</h4>
                            </div>
                            <div className="modal-body">
                                <p>One fine body…</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default connect((state) => {
    return {}
})(SearchBar)


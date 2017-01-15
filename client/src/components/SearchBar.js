'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux'
import {searchItems, upload, reload} from '../actions/items'


class SearchBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            uploadOpen: false,
            files: [],
            tags: []
        };

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);

        this.showUploadMenu = this.showUploadMenu.bind(this);
        this.submitUpload = this.submitUpload.bind(this);
        this.refresh = this.refresh.bind(this);

        this.props.dispatch(searchItems(""))
    }

    handleSearchChange(e) {
        this.props.dispatch(searchItems(e.target.value))
    }

    showUploadMenu() {
        this.setState({
            uploadOpen: !this.state.uploadOpen
        })
    }

    submitUpload(e) {
        e.preventDefault();
        this.props.dispatch(upload({
            files: this.state.files,
            tags: this.state.tags
        }))
    }

    refresh(e) {
        e.preventDefault();
        this.props.dispatch(reload(0))
    }

    handleFileChange(e) {
        e.preventDefault();
        var stateFiles = [],
            files = (e.dataTransfer ? e.dataTransfer.files : e.target.files);

        for (let i = 0; i < files.length || 0; i++) {
            const file = files[i];
            file.preview = window.URL.createObjectURL(file);
            stateFiles.push(file)
        }
        console.log(stateFiles)

        this.setState({
            files: stateFiles
        })
    }

    handleTagChange(e) {
        e.preventDefault();
    }

    render() {

        return (
            <div>
                <div className="page-header">
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search"
                               onChange={this.handleSearchChange}/>
                        <span className="input-group-btn">
                                <button className="btn btn-success" type="button" onClick={this.refresh}>
                                    Refresh
                                </button>
                        </span>
                        <span className="input-group-btn">
                                <button className="btn btn-default" type="button" onClick={this.showUploadMenu}>
                                    {this.state.uploadOpen ? 'Close' : 'Upload'}
                                </button>
                        </span>
                    </div>

                    <div className="upload-container" style={{'display':this.state.uploadOpen ? 'block' : 'none'}}>
                        <form className="form-horizontal" onSubmit={this.submitUpload}>
                            <div className="form-group">
                                <label className="col-lg-1 control-label">Files</label>
                                <div className="col-lg-11">
                                    <span className="btn btn-success btn-file">
                                        Select files
                                        <input type="file" accept="image/*|application/*" multiple name="file"
                                               onChange={this.handleFileChange}/>
                                    </span>
                                    {
                                        this.state.files.map((file, index) => {
                                            if ((/^image\//i).test(file.type))
                                                return <img key={index} className="file-preview"
                                                            src={file.preview}/>
                                            else
                                                return <div key={index}
                                                            className="label label-primary file-preview">{file.name}</div>
                                        })
                                    }
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="col-lg-1 control-label">Tags</label>

                                <div className="col-lg-11">
                                    <input type="text" className="form-control" placeholder="tags"
                                           onChange={this.handleTagChange}/>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="col-lg-12">
                                    <p>{this.props.uploadError}</p>
                                    <button type="submit" className="btn btn-primary pull-right">Upload</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        uploadError: state.items.uploadError
    }
})(SearchBar)


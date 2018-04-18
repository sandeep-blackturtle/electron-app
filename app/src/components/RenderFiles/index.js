import React, { Component } from 'react';

import Image from '../Image/';
import { getFileName, getFileExtension } from '../../utils/helpers';

class RenderFiles extends Component {
    constructor(props) {
        super(props);

        this.renderImages = this.renderImages.bind(this);
        this.renderOtherFiles = this.renderOtherFiles.bind(this);
    }

    renderImages() {
        let key = 0;
        const images = this.props.data.filter((image) => {
            const fileExtension = getFileExtension(getFileName(image.url));
            return fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png';
        });

        return images.map((image) => {
            key += 1;
            return (
                <Image
                    key={key}
                    src={image.url}
                    alt={`File${key}`}
                />
            );
        });
    }

    renderOtherFiles() {
        let key = 0;
        const files = this.props.data.filter((file) => {
            const fileExtension = getFileExtension(getFileName(file.url));
            return fileExtension === 'pdf' || fileExtension === 'json';
        });

        return files.map((file) => {
            key += 1;
            const fileName = getFileName(file.url);
            return (
                <div key={key} className="file">
                    <a href={file.url}>
                        {fileName}
                    </a>
                </div>
            );
        });
    }

    render() {
        return (
            <div className="files-container">
                <div className="images">
                    <p className="title">Images</p>
                    {this.renderImages()}
                </div>
                <div className="files">
                    <p className="title">Other Files</p>
                    {this.renderOtherFiles()}
                </div>
            </div>
        );
    }
}

export default RenderFiles;

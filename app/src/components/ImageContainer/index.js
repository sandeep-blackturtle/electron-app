import React from 'react';

import Image from '../Image/';

const ImageContainer = (props) => {
    let key = 0;

    return (
        <div className="image-container">
            {
                props.data.map((src) => {
                    key += 1;
                    return (
                        <Image
                            key={src.id ? src.id : key}
                            src={src.url}
                            alt={src.name ? src.name : `ImageOffline${key}`}
                        />
                    );
                })
            }
        </div>
    );
};

export default ImageContainer;

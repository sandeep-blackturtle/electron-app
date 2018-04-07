import React from 'react';

import Image from '../Image/';

const ImageContainer = (props) => {
    return (
        <div className="image-container" >
            {
                props.data.map(src => <Image key={src.id} src={src.url} alt={src.name} />)
            }
        </div>
    );
};

export default ImageContainer;

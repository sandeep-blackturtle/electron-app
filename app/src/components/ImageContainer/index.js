import React from 'react'

import Image from '../Image/'

const ImageContainer = (props) => {

    return (
        <div className="image-container" >
            {
                props.data.map((src, i) => <Image key={i} src={src.url}/>)
            }
        </div>
    )
}

export default ImageContainer

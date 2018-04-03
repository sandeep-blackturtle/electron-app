import React  from 'react'

 const Image = (props) => {
    return (
        <div className="image">
            <img src={props.src}/>
        </div>
    )
}

export default Image

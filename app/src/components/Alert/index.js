import React  from 'react'

 const Alert = (props) => {
    return (
        <div className="alert">
            <span>{ props.value }</span>
            { props.children }
        </div>
    )
}

export default Alert;

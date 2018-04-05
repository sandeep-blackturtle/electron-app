import React  from 'react'

 const Alert = (props) => {
    return (
        <div className="button" onClick={props.onClick}>
            <button className={props.className}>{props.value}</button>
        </div>
    )
}

export default Alert;

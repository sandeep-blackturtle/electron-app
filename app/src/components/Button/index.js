import React  from 'react'

 const Button = (props) => {
    return (
        <div className="button" onClick={props.onClick}>
            <button className={props.className}>{props.value}</button>
        </div>
    )
}

export default Button;

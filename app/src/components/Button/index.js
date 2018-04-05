import React  from 'react'

 const Button = (props) => {
    return (
        <div className={props.className} onClick={props.onClick}>
            <button>{props.value}</button>
        </div>
    )
}

export default Button;

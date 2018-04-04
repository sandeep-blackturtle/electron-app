import React from 'react'

const Input = (props) => {

    return (
        <div className="input">
            <label className="lable">{props.lable}</label>
            <input type={props.type} name={props.name} placeholder={props.placeholder}/>
        </div>
    )
}

export default Input;

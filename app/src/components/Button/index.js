import React from 'react';

const Button = (props) => {
    return (
        <div className={props.className} onClick={props.onClick} role={props.type}>
            <button type={props.type} disabled={props.disabled}>{props.value}</button>
        </div>
    );
};

export default Button;

import React from 'react';

const Model = (props) => {
    return (
        <div className="model">
            <div className="model-container">
                <div className={`model-title ${props.titleClassName}`}>{props.title}</div>
                { props.children }
            </div>
        </div>
    );
};

export default Model;

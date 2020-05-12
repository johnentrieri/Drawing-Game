import React from 'react';

const failAlert = (props) => {
    let failAlert = null;
    if (props.status === "FAIL") {
        failAlert = <div className="alert alert-danger" role="alert">{props.message}</div>
    } else {
        failAlert = null;
    }

    return (
        <div>
            {failAlert}
        </div>
    );
};

export default failAlert;

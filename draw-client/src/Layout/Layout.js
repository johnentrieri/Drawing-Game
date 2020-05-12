import React from 'react';

import NavBar from '../Components/NavBar/NavBar';
import Footer from '../Components/Footer/Footer';

const layout = (props) => {
    return (
        <div>
            <NavBar />
            {props.children}
            <Footer />
        </div>
    );
};

export default layout;
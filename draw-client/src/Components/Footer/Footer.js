import React from 'react';
import classes from './Footer.module.css';

const footer = (props) => {
    return (
        <footer className={classes.footer}>
            <span className="text-muted">Drawing Game</span>
        </footer>
    );
};

export default footer;
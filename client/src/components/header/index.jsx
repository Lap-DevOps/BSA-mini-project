import React from 'react';
import { logout } from 'src/components/profile/logic/profileActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './header.module.scss';

const Header = (props) => {
    const isAuthorized = props.token;
    return (
        <div className={styles.root}>
            <div className={styles.title}>Thread.JS</div>
            {isAuthorized && <button type="button" onClick={props.logout}>Logout</button>}
        </div>
    );
};

Header.propTypes = {
    token: PropTypes.string,
    logout: PropTypes.func.isRequired
};

Header.defaultProps = {
    token: undefined
};

const actions = {
    logout
};

const mapStateToProps = rootState => ({
    token: rootState.profile.token
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
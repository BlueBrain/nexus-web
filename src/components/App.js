import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import styled from 'styled-jss';
import PropTypes from 'prop-types';
import List from './List';
import Instance from './Instance';
import Header from './Header';
import { connect } from 'react-redux';
import { login } from '../auth';
import { navigate, loading } from '../store/actions';
import BreadCrumb from './BreadCrumb';
import { version } from '../../package.json';
import Loader from './Loader';

const MainBlock = styled('main')({
  display: 'flex',
  flexGrow: 1,
  width: '100%',
  justifyContent: 'space-around',
  padding: '0.5em',
  boxSizing: 'border-box'
});

const Footer = styled('footer')({
  display: 'flex',
  height: '3em',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'gray',
  backgroundColor: '#f7f9fa'
});

const A = styled('a')({
  color: 'gray'
});

class App extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.startListeningToRequests();
    login(window.location);
    this.props.reconcileRoutes();
  }
  componentWillReceiveProps() {
    this.props.reconcileRoutes();
  }
  render() {
    const { base } = this.props.config;
    const schemasPattern = new RegExp(/schemas\/[^/]*\/[^/]*\//);
    return (
      <React.Fragment>
        <Loader />
        { Header(base) }
        <BreadCrumb />
        <MainBlock>
            <List name = "Organizations" entity="org" />
            <List name = "Domains" entity="domain" />
            <List name = "Schemas" entity="schema" splitPattern = { schemasPattern }/>
            <List name = "Instances" entity="instance" />
            <Instance />
        </MainBlock>
        <Footer>
          Version { version } &nbsp;|&nbsp;
          <A
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/BlueBrain/nexus-explorer/issues">
            Submit an issue
          </A>
        </Footer>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  config: PropTypes.any.isRequired,
  reconcileRoutes: PropTypes.func.isRequired,
  startListeningToRequests: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  return {
    config: state.config,
    location: state.routing.location
  }
}

function mapDispatchToProps (dispatch) {
  return {
    startListeningToRequests: bindActionCreators(loading.startListeningToRequests, dispatch),
    reconcileRoutes: bindActionCreators(navigate.reconcileRoutes, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

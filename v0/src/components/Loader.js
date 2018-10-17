import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from '../libs/debounce';

const DELAY_LOADING_STATE_CHANGE_IN_MILISECONDS = 1000;

const LoaderComponent = isLoading =>
 <div className={`${isLoading && 'loading'} loading-bar`}></div>;

class LoaderContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.componentWillReceiveProps = debounce(this.updateLoader.bind(this), 100);
  }
  updateLoader ({ loading }) {
    setTimeout(() => {
      this.setState({ loading });
    }, DELAY_LOADING_STATE_CHANGE_IN_MILISECONDS);
  }
  render() {
    return LoaderComponent(this.state.loading);
  }
}

function mapStateToProps ({ loader }) {
  return {
    loading: !!loader.requests
  };
}

LoaderContainer.propTypes = {
  loading: PropTypes.bool
};

export default connect(mapStateToProps)(LoaderContainer);

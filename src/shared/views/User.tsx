import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';

export interface UserProps {}

const User: React.FunctionComponent<UserProps> = props => {
  return (
    <div className="user-view">
      <h1>User Page</h1>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(User);

import * as React from 'react';
import { connect } from 'react-redux';

const ProjectView: React.FunctionComponent<{}> = ({}) => {
  return <h1>Project View</h1>;
};

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  null,
  mapDispatchToProps
)(ProjectView);

import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

const ResourceView: React.FunctionComponent = props => {
  const location = useLocation();
  console.log('$$$ Studios redirect', location.pathname);
  return (
    <Redirect
      to={{
        pathname: `/studios${location.pathname}`,
        search: location.search,
      }}
    />
  );
};
export default ResourceView;

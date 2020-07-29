import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

const ResourceView: React.FunctionComponent = props => {
  const location = useLocation();
  console.log(location.pathname);
  return (
    <Redirect
      to={{
        pathname: `/studioLegacy${location.pathname}`,
        search: location.search,
      }}
    />
  );
};
export default ResourceView;

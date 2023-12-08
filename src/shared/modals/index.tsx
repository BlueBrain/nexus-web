import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/reducers';
import CreateOrganization from './CreateOrganization/CreateOrganization';
import CreateProject from './CreateProject/CreateProject';
import CreateStudio from './CreateStudio/CreateStudio';

function EntityCreation() {
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const userAuthenticated = Boolean(authenticated) && Boolean(token);

  return (
    userAuthenticated && (
      <React.Fragment>
        <CreateProject />
        <CreateOrganization />
        <CreateStudio />
      </React.Fragment>
    )
  );
}

export default EntityCreation;

import React from 'react';
import { useSelector } from 'react-redux';
import CreateProject from './CreateProject/CreateProject';
import CreateOrganization from './CreateOrganization/CreateOrganization';
import CreateStudio from './CreateStudio/CreateStudio';
import { RootState } from '../store/reducers';

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

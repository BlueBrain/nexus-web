import * as React from 'react';
import { Icon } from 'antd';
import { RootState } from '../../store/reducers';

export const HomeBreadcrumbLabel = (state: RootState) => {
  return (
    <span>
      <Icon type="home" /> Home
    </span>
  );
};

export const LoginBreadcrumbLabel = (state: RootState) => {
  return (
    <span>
      <Icon type="login" /> Login
    </span>
  );
};

export const OrgBreadcrumbLabel = (state: RootState) => {
  if (state.nexus && state.nexus.orgsFetching) {
    return (
      <span>
        <Icon type="bank" /> <Icon type="loading" />
      </span>
    );
  }
  const activeOrg = (state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.org) || { label: '' };
  return (
    <span>
      <Icon type="bank" /> {activeOrg.label || 'org'}
    </span>
  );
};

export const ProjectBreadcrumbLabel = (state: RootState) => {
  if (state.nexus && state.nexus.projectsFetching) {
    return (
      <span>
        <Icon type="solution" /> <Icon type="loading" />
      </span>
    );
  }
  const activeProject = (state.nexus &&
    state.nexus.activeProject &&
    state.nexus.activeProject.project) || { label: '' };
  return (
    <span>
      <Icon type="solution" /> {activeProject.label || 'project'}
    </span>
  );
};

export const RawQueryBreadcrumbLabel = () => {
  return (
    <span>
      <Icon type="search" /> Query
    </span>
  );
};

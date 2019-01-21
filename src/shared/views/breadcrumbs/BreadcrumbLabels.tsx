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
  if (
    state.nexus &&
    state.nexus.activeOrg &&
    state.nexus.activeOrg.isFetching
  ) {
    return (
      <span>
        <Icon type="bank" /> <Icon type="loading" />
      </span>
    );
  }
  // TODO what should be the behavior if nothing is found?
  const activeOrgLabel =
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.data &&
      state.nexus.activeOrg.data.org.label) ||
    'org';
  return (
    <span>
      <Icon type="bank" /> {activeOrgLabel}
    </span>
  );
};

export const ProjectBreadcrumbLabel = (state: RootState) => {
  if (
    state.nexus &&
    state.nexus.activeProject &&
    state.nexus.activeProject &&
    state.nexus.activeProject.isFetching
  ) {
    return (
      <span>
        <Icon type="solution" /> <Icon type="loading" />
      </span>
    );
  }
  // TODO what should be the behavior if nothing is found?
  const activeProjectLabel =
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data &&
      state.nexus.activeProject.data.label) ||
    'project';
  return (
    <span>
      <Icon type="solution" /> {activeProjectLabel}
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

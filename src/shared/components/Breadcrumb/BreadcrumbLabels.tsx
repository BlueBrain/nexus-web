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

export const OrgBreadcrumbLabel = (state: RootState) => {
  if (state.nexus && state.nexus.fetching) {
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
      <Icon type="bank" /> {activeOrg.label || 'project'}
    </span>
  );
};

export const ProjectBreadcrumbLabel = (state: RootState) => {
  if (state.nexus && state.nexus.fetching) {
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
      <Icon type="bank" /> {activeProject.label || 'project'}
    </span>
  );
};

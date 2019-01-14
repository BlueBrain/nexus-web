import * as React from 'react';
import { Icon } from 'antd';
import { RootState } from '../../store/reducers';
import { getProp } from '../../utils';

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
  const activeOrgLabel = getProp(state, 'nexus.activeorg.org', 'org');
  return (
    <span>
      <Icon type="bank" /> {activeOrgLabel}
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
  const activeProjectLabel = getProp(
    state,
    'nexus.project.data.label',
    'project'
  );
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

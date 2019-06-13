import * as React from 'react';
import { connect } from 'react-redux';
import RawSparqlQueryView from '../components/RawQueryView/RawSparqlQueryView';
import RawElasticSearchQueryView from '../components/RawQueryView/RawElasticSearchQueryView';
import { NexusState } from '../store/reducers/nexus';
import { RouteComponentProps, match } from 'react-router';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import * as queryString from 'query-string';
import { Resource } from '@bbp/nexus-sdk-legacy';
import { push } from 'connected-react-router';

interface RawQueryProps extends RouteComponentProps {
  activeOrg: { label: string };
  activeProject: { label: string };
  activeView?: { id: string };
  busy: boolean;
  fetchProject(orgName: string, projectName: string): void;
  match: match<{ org: string; project: string; view?: string }>;
  location: any;
}

export const RawElasticSearchQueryComponent: React.FunctionComponent<
  RawQueryProps
> = ({
  match,
  activeOrg,
  activeProject,
  fetchProject,
  location,
}): JSX.Element => {
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.org, match.params.project]);
  const query = queryString.parse(location.search).query;
  return (
    <RawElasticSearchQueryView
      initialQuery={query}
      wantedOrg={match.params.org}
      wantedProject={match.params.project}
      wantedView={match.params.view}
    />
  );
};

const RawSparqlQueryComponent: React.FunctionComponent<RawQueryProps> = ({
  match,
  activeOrg,
  activeProject,
  fetchProject,
}): JSX.Element => {
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
    }
  }, [match.params.org, match.params.project]);
  return (
    <RawSparqlQueryView
      wantedOrg={match.params.org}
      wantedProject={match.params.project}
      wantedView={match.params.view}
    />
  );
};

const mapStateToProps = (state: NexusState) => ({
  activeOrg: (state &&
    state.activeOrg &&
    state.activeOrg.data &&
    state.activeOrg.data.org) || { label: '' },
  activeProject: (state && state.activeProject && state.activeProject.data) || {
    label: '',
  },
  busy:
    (state && state.activeProject && state.activeProject.isFetching) || false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (org: string, project: string) => {
    dispatch(fetchOrg(org));
    dispatch(fetchAndAssignProject(org, project));
  },
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export const RawSparqlQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSparqlQueryComponent);

export const RawElasticSearchQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryComponent);

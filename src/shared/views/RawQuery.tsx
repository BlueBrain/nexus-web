import * as React from 'react';
import { connect } from 'react-redux';
import RawQueryView from '../components/RawQueryView/RawQueryView';
import { fetchProject } from '../store/actions/nexus';
import { NexusState } from '../store/reducers/nexus';
import { RouteComponentProps, match } from 'react-router';

interface RawQueryProps extends RouteComponentProps {
  activeOrg: { label: string };
  activeProject: { label: string };
  busy: boolean;
  fetchProject(orgName: string, projectName: string): void;
  match: match<{org: string, project: string }>;
}

export const RawElasticSearchQuery: React.FunctionComponent<RouteComponentProps> = (match: any) : JSX.Element => {
  return (
    <RawQueryView viewType="es" wantedOrg={match.params.org} wantedProject={match.params.project} />
  );
};

const RawSparqlQueryComponent: React.FunctionComponent<RawQueryProps> = ({ match, activeOrg, activeProject, fetchProject }) : JSX.Element => {
  React.useEffect(
    () => {
      if (activeOrg.label !== match.params.org || activeProject.label !== match.params.project) {
        fetchProject(match.params.org, match.params.project);
      }
    },
    [match.params.org, match.params.project]
  );
  return (
    <RawQueryView viewType="sparql" wantedOrg={match.params.org} wantedProject={match.params.project} />
  );
};

const mapStateToProps = (state: NexusState) => ({
  activeOrg: (state &&
    state.activeOrg &&
    state.activeOrg.org) || { label: '' },
  activeProject: (state &&
    state.activeProject &&
    state.activeProject.project) || { label: '' },
  busy:
    (state &&
      (state.projectFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (orgName: string, projectName: string) => dispatch(fetchProject(orgName, projectName)),
});

export const RawSparqlQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSparqlQueryComponent);

import * as React from 'react';
import { connect } from 'react-redux';
import RawSparqlQueryView from '../components/RawQueryView/RawSparqlQueryView';
import RawElasticSearchQueryView from '../components/RawQueryView/RawElasticSearchQueryView';
import { NexusState } from '../store/reducers/nexus';
import { RouteComponentProps, match } from 'react-router';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import * as queryString from 'query-string';
import { push } from 'connected-react-router';
import { Menu, Dropdown, Icon } from 'antd';
import { listViews } from '../store/actions/nexus/views';
import { Resource } from '@bbp/nexus-sdk-legacy';
import { isElasticView } from '../utils/nexus-maybe';
import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';

interface RawQueryProps extends RouteComponentProps {
  activeOrg: { label: string };
  activeProject: { label: string };
  activeView?: { id: string };
  busy: boolean;
  fetchProject(orgName: string, projectName: string): void;
  match: match<{ org: string; project: string; view: string }>;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  goToView(orgLabel: string, projectLabel: string, view: Resource): void;
  listViews(orgLabel: string, projectLabel: string): Promise<Resource[]>;
  location: any;
}

export const RawElasticSearchQueryComponent: React.FunctionComponent<
  RawQueryProps
> = ({
  match,
  activeOrg,
  activeProject,
  fetchProject,
  goToOrg,
  goToProject,
  goToView,
  location,
  listViews,
}): JSX.Element => {
  const [views, setViews] = React.useState<Resource[]>([]);
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
      listViews(match.params.org, match.params.project)
        .then(setViews)
        .catch((error: Error) => {
          // do something
        });
    }
  }, [match.params.org, match.params.project]);
  const view = decodeURIComponent(match.params.view);
  const query = queryString.parse(location.search).query;
  const menu = (
    <Menu>
      {views.map((view, index) => (
        <Menu.Item key={index}>
          <a onClick={() => goToView(view.orgLabel, view.projectLabel, view)}>
            {view.name}
          </a>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <a onClick={() => goToOrg(match.params.org)}>
                {match.params.org}
              </a>{' '}
              |{' '}
              <a
                onClick={() =>
                  goToProject(match.params.org, match.params.project)
                }
              >
                {match.params.project}
              </a>{' '}
              |{' '}
            </span>
            <Dropdown overlay={menu}>
              <a className="ant-dropdown-link">
                {view}
                <Icon type="down" />
              </a>
            </Dropdown>{' '}
          </h1>
          <div style={{ marginLeft: 10 }}>
            <ViewStatisticsProgress
              orgLabel={match.params.org}
              projectLabel={match.params.project}
              resourceId={match.params.view}
            />
          </div>
        </div>
      </div>
      <div className="view-view view-container">
        <div style={{ width: '100%' }}>
          <RawElasticSearchQueryView
            initialQuery={query}
            wantedOrg={match.params.org}
            wantedProject={match.params.project}
            wantedView={match.params.view}
          />
        </div>
      </div>
    </>
  );
};

const RawSparqlQueryComponent: React.FunctionComponent<RawQueryProps> = ({
  match,
  activeOrg,
  activeProject,
  goToOrg,
  goToProject,
  goToView,
  fetchProject,
  listViews,
}): JSX.Element => {
  const [views, setViews] = React.useState<Resource[]>([]);
  React.useEffect(() => {
    if (
      activeOrg.label !== match.params.org ||
      activeProject.label !== match.params.project
    ) {
      fetchProject(match.params.org, match.params.project);
      listViews(match.params.org, match.params.project)
        .then(setViews)
        .catch((error: Error) => {
          // do something
        });
    }
  }, [match.params.org, match.params.project]);
  const view = decodeURIComponent(match.params.view);
  const menu = (
    <Menu>
      {views.map((view, index) => (
        <Menu.Item key={index}>
          <a onClick={() => goToView(view.orgLabel, view.projectLabel, view)}>
            {view.name}
          </a>
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <a onClick={() => goToOrg(match.params.org)}>
                {match.params.org}
              </a>{' '}
              |{' '}
              <a
                onClick={() =>
                  goToProject(match.params.org, match.params.project)
                }
              >
                {match.params.project}
              </a>{' '}
              |{' '}
            </span>
            <Dropdown overlay={menu}>
              <a className="ant-dropdown-link">
                {view}
                <Icon type="down" />
              </a>
            </Dropdown>{' '}
          </h1>
          <div style={{ marginLeft: 10 }}>
            <ViewStatisticsProgress
              orgLabel={match.params.org}
              projectLabel={match.params.project}
              resourceId={match.params.view}
            />
          </div>
        </div>
      </div>
      <div className="view-view view-container">
        <div style={{ width: '100%' }}>
          <RawSparqlQueryView
            wantedOrg={match.params.org}
            wantedProject={match.params.project}
            wantedView={encodeURIComponent(view)}
          />
        </div>
      </div>
    </>
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
  goToView: (orgLabel: string, projectLabel: string, view: Resource) => {
    const queryAppendage = isElasticView(view) ? `_search` : `sparql`;
    return dispatch(
      push(
        `/${orgLabel}/${projectLabel}/${encodeURIComponent(
          view.raw['@id']
        )}/${queryAppendage}`
      )
    );
  },
  listViews: (orgLabel: string, projectLabel: string) =>
    dispatch(listViews(orgLabel, projectLabel)),
});

export const RawSparqlQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawSparqlQueryComponent);

export const RawElasticSearchQuery = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawElasticSearchQueryComponent);

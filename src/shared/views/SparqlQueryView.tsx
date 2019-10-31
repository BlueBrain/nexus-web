import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import * as queryString from 'query-string';
import { push } from 'connected-react-router';
import { Menu, Dropdown, Icon, notification } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import SparqlQueryContainer from '../containers/SparqlQuery';

const SparqlQueryView: React.FunctionComponent<{
  match: match<{ org: string; project: string; viewId: string }>;
  location: Location;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  goToView(
    orgLabel: string,
    projectLabel: string,
    viewID: string,
    viewType: string[] | string
  ): void;
}> = ({ match, location, goToOrg, goToProject, goToView }): JSX.Element => {
  const {
    params: { org: orgLabel, project: projectLabel, viewId },
  } = match;
  const [{ _results: views }, setViews] = React.useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const decodedViewId = decodeURIComponent(viewId);
  const query = queryString.parse(location.search).query;

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel)
      .then(setViews)
      .catch(error => {
        notification.error({
          message: 'Problem loading Views',
          description: error.message,
        });
      });
  }, [orgLabel, projectLabel]);

  const menu = (
    <Menu>
      {views.map((view: View, index: number) => (
        <Menu.Item key={index}>
          <a
            onClick={() => {
              if (view['@type']) {
                return goToView(
                  orgLabel,
                  projectLabel,
                  view['@id'],
                  view['@type']
                );
              }
            }}
          >
            {view['@id']}
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
              <a onClick={() => goToOrg(orgLabel)}>{orgLabel}</a> |{' '}
              <a onClick={() => goToProject(orgLabel, projectLabel)}>
                {projectLabel}
              </a>{' '}
              |{' '}
            </span>
            <Dropdown overlay={menu}>
              <a className="ant-dropdown-link">
                {decodedViewId}
                <Icon type="down" />
              </a>
            </Dropdown>{' '}
          </h1>
          <div style={{ marginLeft: 10 }}>
            <ViewStatisticsProgress
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              resourceId={viewId}
            />
          </div>
        </div>
      </div>
      <div className="view-view view-container -unconstrained-width">
        <SparqlQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={Array.isArray(query) ? query.join(',') : query}
          viewId={viewId}
        />
      </div>
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  goToOrg: (orgLabel: string) => dispatch(push(`/${orgLabel}`)),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
  goToView: (
    orgLabel: string,
    projectLabel: string,
    viewId: string,
    viewType: string[] | string
  ) => {
    const stringifiedViewType = Array.isArray(viewType)
      ? viewType.join('')
      : viewType;
    return dispatch(
      push(
        `/${orgLabel}/${projectLabel}/${encodeURIComponent(viewId)}/${
          stringifiedViewType.toLowerCase().includes('elastic')
            ? '_search'
            : 'sparql'
        }`
      )
    );
  },
});

export default connect(
  null,
  mapDispatchToProps
)(SparqlQueryView);

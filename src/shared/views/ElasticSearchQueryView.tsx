import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import * as queryString from 'query-string';
import { push } from 'connected-react-router';
import { Menu, Dropdown, Icon } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';

const ElasticSearchQueryView: React.FunctionComponent<{
  match: match<{ orgLabel: string; projectLabel: string; viewId: string }>;
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
    params: { orgLabel, projectLabel, viewId },
  } = match;
  const [{ _results: views, _total: viewTotal }, setViews] = React.useState<
    ViewList
  >({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const view = decodeURIComponent(viewId);
  const query = queryString.parse(location.search).query;

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel)
      .then(setViews)
      .catch(() => {
        // 503 ?
      });
  }, [orgLabel, projectLabel]);

  const menu = (
    <Menu>
      {views.map((view: View, index: number) => (
        <Menu.Item key={index}>
          <a
            onClick={() =>
              goToView(orgLabel, projectLabel, view['@id'], view['@id'])
            }
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
                {view}
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
        <ElasticSearchQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={query ? JSON.parse(`${query}`) : null}
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
)(ElasticSearchQueryView);

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

export const ElasticSearchQueryView: React.FunctionComponent<{
  match: match<{ org: string; project: string; viewId: string }>;
  location: Location;
  goToOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  goToView(orgLabel: string, projectLabel: string, viewID: string): void;
}> = ({ match, location, goToOrg, goToProject, goToView }): JSX.Element => {
  const {
    params: { org: orgLabel, project: projectLabel, viewId },
  } = match;
  const [{ _results: views, total: viewTotal }, setViews] = React.useState<
    ViewList
  >({
    '@context': {},
    total: 0,

    // @ts-ignore TODO fix incorrect typing in SDK
    // Should be _results not _result!
    // https://github.com/BlueBrain/nexus/issues/753
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
          <a onClick={() => goToView(orgLabel, projectLabel, view['@id'])}>
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
      <div className="view-view view-container">
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
  goToView: (orgLabel: string, projectLabel: string, viewId: string) => {
    return dispatch(
      push(`/${orgLabel}/${projectLabel}/${encodeURIComponent(viewId)}/_search`)
    );
  },
});

export default connect(
  null,
  mapDispatchToProps
)(ElasticSearchQueryView);

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
import LinkContainer from '../containers/LinkContainer';

const ElasticSearchQueryView: React.FunctionComponent<{
  match: match<{ orgLabel: string; projectLabel: string; viewId: string }>;
  location: Location;
}> = ({ match, location }): JSX.Element => {
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
      {views.map((view: View, index: number) => {
        const stringifiedViewType = Array.isArray(view['@type'])
          ? view['@type'].join('')
          : view['@type'];
        const viewName = (stringifiedViewType || '')
          .toLowerCase()
          .includes('elastic')
          ? 'ElasticSearchQueryView'
          : 'SparqlQueryView';
        return (
          <Menu.Item key={index}>
            <LinkContainer
              viewName={viewName}
              pathOptions={{
                orgLabel,
                projectLabel,
                viewId: view['@id'],
              }}
            >
              {view['@id']}
            </LinkContainer>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <LinkContainer
                viewName="ProjectsView"
                pathOptions={{
                  orgLabel,
                }}
              >
                {orgLabel}
              </LinkContainer>
              |{' '}
              <LinkContainer
                viewName="ProjectView"
                pathOptions={{
                  orgLabel,
                  projectLabel,
                }}
              >
                {projectLabel}
              </LinkContainer>{' '}
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

export default ElasticSearchQueryView;

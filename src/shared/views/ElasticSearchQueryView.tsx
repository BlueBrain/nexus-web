import * as React from 'react';
import { match } from 'react-router';
import * as queryString from 'query-string';
import { Menu, Dropdown, Icon, Tooltip } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';
import { getResourceLabel, labelOf } from '../utils';
import { Link } from 'react-router-dom';

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
  const decodedViewId = decodeURIComponent(viewId);
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
        const pathAppendage = (stringifiedViewType || '')
          .toLowerCase()
          .includes('elastic')
          ? '_search'
          : 'sparql';
        return (
          <Menu.Item key={index}>
            <Link
              to={`/${orgLabel}/${projectLabel}/${encodeURIComponent(
                view['@id']
              )}/${pathAppendage}`}
            >
              {getResourceLabel(view)}
            </Link>
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
              <Link to="/">
                <Tooltip title="Back to all organizations" placement="right">
                  <Icon type="home" />
                </Tooltip>
              </Link>
              {' | '}
              <Link to={`/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/${orgLabel}/${projectLabel}`}>{projectLabel}</Link>
              {' | '}
            </span>
            <Dropdown overlay={menu}>
              <span>
                {labelOf(decodedViewId)}
                <Icon type="down" />
              </span>
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

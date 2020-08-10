import * as React from 'react';
import { useRouteMatch, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { Menu, Dropdown, Icon } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';
import HomeIcon from '../components/HomeIcon';
import { getResourceLabel, labelOf } from '../../../shared/utils';
import { useAdminSubappContext } from '..';

const ElasticSearchQueryView: React.FunctionComponent = (): JSX.Element => {
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const { namespace } = useAdminSubappContext();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
      viewId: '',
    },
  };
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
              to={`/${namespace}/${orgLabel}/${projectLabel}/${encodeURIComponent(
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
              <HomeIcon />
              {' | '}
              <Link to={`/${namespace}/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/${namespace}/${orgLabel}/${projectLabel}`}>
                {projectLabel}
              </Link>
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

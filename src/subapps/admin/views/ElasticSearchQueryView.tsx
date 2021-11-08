import * as React from 'react';
import { useRouteMatch, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { Menu } from 'antd';
import { ViewList, View, DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';
import { getResourceLabel } from '../../../shared/utils';
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
      <div className="view-view view-container -unconstrained-width">
        <ElasticSearchQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={query ? JSON.parse(`${query}`) : null}
          viewId={
            viewId ? viewId : encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID)
          }
        />
      </div>
    </>
  );
};

export default ElasticSearchQueryView;

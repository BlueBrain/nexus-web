import * as React from 'react';
import { useRouteMatch, useLocation } from 'react-router';
import * as queryString from 'query-string';
import { ViewList, DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';

const ElasticSearchQueryView: React.FunctionComponent = (): JSX.Element => {
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
      viewId: '',
    },
  };
  const [, setViews] = React.useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const query = queryString.parse(location.search).query;

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel)
      .then(setViews)
      .catch(() => {
        // 503 ?
      });
  }, [orgLabel, projectLabel]);

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

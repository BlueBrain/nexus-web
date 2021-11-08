import * as React from 'react';
import { useLocation, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { Menu } from 'antd';
import { ViewList, View, DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import SparqlQueryContainer from '../containers/SparqlQuery';
import { getResourceLabel } from '../../../shared/utils';
import { useAdminSubappContext } from '..';
import useNotification from '../../../shared/hooks/useNotification';

const SparqlQueryView: React.FunctionComponent = (): JSX.Element => {
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const notification = useNotification();
  const { namespace } = useAdminSubappContext();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match;

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
      .catch(error => {
        notification.error({
          message: 'Problem loading Views',
          description: error.message,
        });
      });
  }, [orgLabel, projectLabel]);

  return (
    <>
      <div className="view-view view-container -unconstrained-width">
        <SparqlQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={Array.isArray(query) ? query.join(',') : query}
          viewId={viewId ? viewId : encodeURIComponent(DEFAULT_SPARQL_VIEW_ID)}
        />
      </div>
    </>
  );
};

export default SparqlQueryView;

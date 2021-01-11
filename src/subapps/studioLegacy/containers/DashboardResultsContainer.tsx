import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { message, Skeleton } from 'antd';
import { ElasticSearchView, Resource, SparqlView, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { match, when } from 'ts-pattern';

import { parseProjectUrl } from '../../../shared/utils';
import useAsyncCall from '../../../shared/hooks/useAsynCall';
import DashboardSparqlQueryContainer from './DashboardResults/DashboardSparqlQueryContainer';
import DashboardElasticSearchQueryContainer from './DashboardResults/DashboardElasticSearchQueryContainer';

const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  dashboardLabel: string;
}> = ({ orgLabel, projectLabel, dataQuery, viewId, dashboardLabel }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();

  const goToStudioResource = (selfUrl: string) => {
    nexus
      .httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        history.push(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`,
          { background: location }
        );
      })
      .catch(error => {
        message.error(`Resource ${self} could not be found`);
      });
  };

  const viewResult = useAsyncCall<View, Error>(
    nexus.View.get(orgLabel, projectLabel, viewId),
    [orgLabel, projectLabel, viewId]
  );

  return match(viewResult)
    .with({ loading: true }, () => <Skeleton active={true} />)
    .with(
      {
        error: null,
        data: when(data => !!(data && data['@type']?.includes('SparqlView'))),
      },
      () => (
        <DashboardSparqlQueryContainer
          view={viewResult.data as SparqlView}
          dataQuery={dataQuery}
          dashboardLabel={dashboardLabel}
          goToStudioResource={goToStudioResource}
        />
      )
    )
    .with(
      {
        error: null,
        data: when(
          data => !!(data && data['@type']?.includes('ElasticSearchView'))
        ),
      },
      () => (
        <DashboardElasticSearchQueryContainer
          view={viewResult.data as ElasticSearchView}
          dataQuery={dataQuery}
          dashboardLabel={dashboardLabel}
          goToStudioResource={goToStudioResource}
        />
      )
    )
    .run();
};

export default DashboardResultsContainer;

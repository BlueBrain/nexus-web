import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Empty, message, Skeleton } from 'antd';
import {
  ElasticSearchView,
  Resource,
  SparqlView,
  View,
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { match, when } from 'ts-pattern';

import { parseProjectUrl } from '../../../shared/utils';
import useAsyncCall from '../../../shared/hooks/useAsynCall';
import DashboardSparqlQueryContainer from './DashboardResults/DashboardSparqlQueryContainer';
import DashboardElasticSearchQueryContainer from './DashboardResults/DashboardElasticSearchQueryContainer';
import { ResultTableFields } from '../../../shared/types/search';

const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  fields?: ResultTableFields[];
  dashboardLabel: string;
}> = ({
  orgLabel,
  projectLabel,
  dataQuery,
  viewId,
  dashboardLabel,
  fields,
}) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();

  const goToStudioResource = (selfUrl: string) => {
    const queryParams = selfUrl.split('?')[1];
    nexus
      .httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        let path = `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
          resource['@id']
        )}`;
        if (queryParams) {
          path = `${path}?${queryParams}`;
        }
        history.push(path, { background: location });
      })
      .catch(() => {
        message.error(`Resource ${self} could not be found`);
      });
  };

  const viewResult = useAsyncCall<View, Error>(
    nexus.View.get(orgLabel, projectLabel, encodeURIComponent(viewId)),
    [orgLabel, projectLabel, viewId]
  );

  return match(viewResult)
    .with({ loading: true }, () => <Skeleton active={true} />)
    .with(
      {
        error: null,
        data: when(
          (data: any) =>
            !!(
              data &&
              (data['@type']?.includes('SparqlView') ||
                data['@type']?.includes('AggregateSparqlView'))
            )
        ),
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
          fields={fields}
          view={viewResult.data as ElasticSearchView}
          dataQuery={dataQuery}
          goToStudioResource={goToStudioResource}
        />
      )
    )
    .otherwise(() => {
      return <Empty description={viewResult.error?.message}></Empty>;
    });
};

export default DashboardResultsContainer;

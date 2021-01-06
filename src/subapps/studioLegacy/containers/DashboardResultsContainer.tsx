import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Spin, Alert, message } from 'antd';
import {
  SelectQueryResponse,
  SparqlViewQueryResponse,
  Resource,
  View,
  NexusClient,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ResultsTable, {
  ResultTableProps,
} from '../../../shared/components/ResultsTable/ResultsTable';
import { camelCaseToLabelString, parseProjectUrl } from '../../../shared/utils';
import useAsyncCall from '../../../shared/hooks/useAsynCall';

export interface QuerySparqlViewWithDataQueryProps {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  dataQuery: string;
  viewId: string;
}

const querySparqlViewWithDataQuery = ({
  nexus,
  orgLabel,
  projectLabel,
  dataQuery,
  viewId,
}: QuerySparqlViewWithDataQueryProps) => async () => {
  // const view = await nexus.View.get(orgLabel, projectLabel, viewId);
  // if (view && view['@type']?.includes('ElasticSearchView')) {
  //   // TODO : Execute an ES query and implement display logic.
  //   return [];
  // }
  const result: SparqlViewQueryResponse = await nexus.View.sparqlQuery(
    orgLabel,
    projectLabel,
    encodeURIComponent(viewId),
    dataQuery
  );
  const data: SelectQueryResponse = result as SelectQueryResponse;
  const tempHeaderProperties: {
    title: string;
    dataIndex: string;
  }[] = data.head.vars
    .filter(
      // we don't want to display total or self url in result table
      (headVar: string) => !(headVar === 'total' || headVar === 'self')
    )
    .map((headVar: string) => ({
      title: camelCaseToLabelString(headVar), // TODO: get the matching title from somewhere?
      dataIndex: headVar,
    }));
  const headerProperties = tempHeaderProperties;
  // build items
  const items = data.results.bindings
    // we only want resources
    .filter((binding: Binding) => binding.self)
    .map((binding: Binding, index: number) => {
      // let's get the value for each headerProperties
      const properties = tempHeaderProperties.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.dataIndex]:
            (binding[curr.dataIndex] && binding[curr.dataIndex].value) ||
            undefined,
        }),
        {}
      );
      // return item data

      return {
        ...properties, // our properties
        id: index.toString(), // id is used by antd component
        self: binding.self, // used in order to load details or resource once selected
        key: index.toString(), // used by react component (unique key)
      };
    });
  return {
    headerProperties,
    items,
  };
};

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

type NexusSparqlError = {
  reason: string;
};

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

  const [view, setView] = React.useState<View>();

  React.useEffect(() => {
    nexus.View.get(orgLabel, projectLabel, viewId).then(result => {
      setView(result);
    });
  }, [viewId]);

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

  const queryResult = useAsyncCall<
    {
      headerProperties: ResultTableProps['headerProperties'];
      items: ResultTableProps['items'];
    },
    Error | NexusSparqlError
  >(
    querySparqlViewWithDataQuery({
      nexus,
      orgLabel,
      projectLabel,
      dataQuery,
      viewId,
    })(),
    [dataQuery, view, viewId]
  );

  if (queryResult.error) {
    return (
      <Alert
        message="Error loading dashboard"
        description={`Something went wrong. ${(queryResult.error as NexusSparqlError)
          .reason || (queryResult.error as Error).message}`}
        type="error"
      />
    );
  }

  return (
    <Spin spinning={queryResult.loading}>
      <ResultsTable
        headerProperties={queryResult.data?.headerProperties}
        items={queryResult.data?.items || []}
        handleClick={goToStudioResource}
        tableLabel={dashboardLabel}
      />
    </Spin>
  );
};

export default DashboardResultsContainer;

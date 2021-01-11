import * as React from 'react';
import {
  NexusClient,
  SelectQueryResponse,
  SparqlView,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';
import { Alert, Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import { camelCaseToLabelString } from '../../../../shared/utils';
import useAsyncCall from '../../../../shared/hooks/useAsynCall';
import SparqlResultsTable, {
  ResultTableProps,
} from '../../../../shared/components/SparqlResultsTable';
import { parseURL } from '../../../../shared/utils/nexusParse';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

export type NexusSparqlError = {
  reason: string;
};

export interface QuerySparqlViewWithDataQueryProps {
  nexus: NexusClient;
  dataQuery: string;
  view: SparqlView;
}

const querySparqlViewWithDataQuery = ({
  nexus,
  dataQuery,
  view,
}: QuerySparqlViewWithDataQueryProps) => async () => {
  const { org: orgLabel, project: projectLabel, id: viewId } = parseURL(
    view._self
  );
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

const DashboardSparqlQueryContainer: React.FC<{
  view: SparqlView;
  dataQuery: string;
  dashboardLabel: string;
  goToStudioResource: (selfUrl: string) => void;
}> = ({ view, dataQuery, dashboardLabel, goToStudioResource }) => {
  const nexus = useNexusContext();

  const queryResult = useAsyncCall<
    {
      headerProperties: ResultTableProps['headerProperties'];
      items: ResultTableProps['items'];
    },
    Error | NexusSparqlError
  >(
    querySparqlViewWithDataQuery({
      nexus,
      view,
      dataQuery,
    })(),
    [dataQuery, view]
  );

  return (
    <Spin spinning={queryResult.loading}>
      {queryResult.error && (
        <Alert
          message="Error loading dashboard"
          description={`Something went wrong. ${(queryResult.error as NexusSparqlError)
            .reason || (queryResult.error as Error).message}`}
          type="error"
        />
      )}
      {queryResult.data && (
        <SparqlResultsTable
          headerProperties={queryResult.data?.headerProperties}
          items={queryResult.data?.items || []}
          handleClick={goToStudioResource}
          tableLabel={dashboardLabel}
        />
      )}
    </Spin>
  );
};

export default DashboardSparqlQueryContainer;

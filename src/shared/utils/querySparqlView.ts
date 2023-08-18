import {
  NexusClient,
  SelectQueryResponse,
  SparqlView,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk/es';
import { camelCaseToLabelString } from '.';
import { parseURL } from './nexusParse';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

export interface QuerySparqlViewProps {
  nexus: NexusClient;
  dataQuery: string;
  view: SparqlView;
}

export const sparqlQueryExecutor = async (
  nexus: NexusClient,
  dataQuery: string,
  view: SparqlView,
  hasProjection: boolean,
  projectionId?: string
) => {
  const { org: orgLabel, project: projectLabel, id: viewId } = parseURL(
    view._self
  );
  const result: SparqlViewQueryResponse = hasProjection
    ? await nexus.View.compositeSparqlQuery(
        orgLabel,
        projectLabel,
        encodeURIComponent(view['@id'] ?? viewId),
        encodeURIComponent(projectionId || '_'),
        dataQuery
      )
    : await nexus.View.sparqlQuery(
        orgLabel,
        projectLabel,
        encodeURIComponent(view['@id'] ?? viewId),
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
      title: camelCaseToLabelString(headVar),
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
        ...properties,
        id: index.toString(),
        self: binding.self,
        key: index.toString(), // used by react component (unique key)
      };
    });

  return {
    headerProperties,
    items,
  };
};

export const querySparqlView = ({
  nexus,
  dataQuery,
  view,
}: QuerySparqlViewProps) => async () => {
  return await sparqlQueryExecutor(nexus, dataQuery, view, false);
};

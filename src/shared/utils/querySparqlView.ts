import {
  NexusClient,
  SelectQueryResponse,
  SparqlView,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';
import { camelCaseToLabelString } from '.';
import { parseURL } from './nexusParse';
import { kebabCase } from 'lodash';
import { Sha1 } from '@aws-crypto/sha1-browser';

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

// async function sha1(text: string) {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(text);
//   const hashBuffer = await crypto.subtle.digest('SHA-1', data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//   return hashHex;
// }

export const sparqlQueryExecutor = async (
  nexus: NexusClient,
  dataQuery: string,
  view: SparqlView,
  hasProjection: boolean,
  projectionId?: string,
  apiEndpoint?: string,
  selectedWorkspace?: any,
  selectedDashboard?: any
) => {
  const { org: orgLabel, project: projectLabel, id: viewId } = parseURL(
    view._self
  );

  const SparqlParser = require('sparqljs').Parser;
  const parser = new SparqlParser();

  const parsedQuery = parser.parse(dataQuery);
  console.log('@@parsedQuery', parsedQuery);

  const whereClause = parsedQuery['where'];
  const type = whereClause
    .reduce((acc: any, cur: any) => [...acc, ...(cur['triples'] ?? [])], [])
    .find(
      (k: any) =>
        k.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    )
    ?.object.value.split('/')
    .pop();

  const self = whereClause
    .reduce((acc: any, cur: any) => [...acc, ...(cur['triples'] ?? [])], [])
    .find(
      (k: any) =>
        k.predicate.value ===
        'https://bluebrain.github.io/nexus/vocabulary/self'
    )?.subject.value;

  const hashInstance = new Sha1();
  hashInstance.update(dataQuery);
  const hashBuffer = await hashInstance.digest();
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // const hash = await sha1(dataQuery);
  const queryParams = new URLSearchParams();
  if (!type) queryParams.append('self', encodeURIComponent(self));
  else queryParams.append('type', type);
  queryParams.append('ws', kebabCase(selectedWorkspace?.label.toLowerCase()));
  queryParams.append('dsh', kebabCase(selectedDashboard?.label.toLowerCase()));
  queryParams.append('hash', hash);

  const url = `${apiEndpoint}/views/${orgLabel}/${projectLabel}/sprqlOverride?${queryParams.toString()}`;

  console.log('@@url', url);
  const result = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
    },
  })
    .then(res => res.json())
    .catch(er => console.error);

  // const result: SparqlViewQueryResponse = hasProjection
  //   ? await nexus.View.compositeSparqlQuery(
  //     orgLabel,
  //     projectLabel,
  //     encodeURIComponent(view['@id'] ?? viewId),
  //     encodeURIComponent(projectionId || '_'),
  //     dataQuery
  //   )
  //   : await nexus.View.sparqlQuery(
  //     orgLabel,
  //     projectLabel,
  //     encodeURIComponent(view['@id'] ?? viewId),
  //     dataQuery
  //   );
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

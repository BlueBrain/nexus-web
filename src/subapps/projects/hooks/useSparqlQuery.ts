import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { SelectQueryResponse, SparqlViewQueryResponse } from '@bbp/nexus-sdk';

import { camelCaseToLabelString } from '../../../shared/utils';
import { displayError } from '../components/Notifications';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

export type Item = {
  id: string;
  self: string;
  key: string;
  [key: string]: any;
};

export const useSparqlQuery = (orgLabel: string, projectLabel: string) => {
  const nexus = useNexusContext();
  const [items, setItems] = React.useState<any[]>();
  const [headerProperties, setHeaderProperties] = React.useState<any[]>([]);

  const viewId = 'nxv:defaultSparqlIndex';

  const fetchDataQithSparql = (query: string) => {
    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      query
    )
      .then((result: SparqlViewQueryResponse) => {
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

        setHeaderProperties(tempHeaderProperties);
        // build items
        const tempItems = data.results.bindings
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

        setItems(tempItems);
      })
      .catch(error => {
        displayError(error, 'Failed to fetch linked Activities');
      });
  };

  return {
    fetchDataQithSparql,
    items,
    headerProperties,
  };
};

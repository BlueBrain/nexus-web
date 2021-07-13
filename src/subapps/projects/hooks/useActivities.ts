import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { SelectQueryResponse, SparqlViewQueryResponse } from '@bbp/nexus-sdk';

import { camelCaseToLabelString } from '../../../shared/utils';
import { notification } from 'antd';
import {
  distanceFromTopToDisplay,
  parseNexusError,
} from '../../../shared/hooks/useNotification';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

export type ActivityItem = {
  id: string;
  self: string;
  key: string;
  [key: string]: any;
};

export const useLinkedActivities = (
  orgLabel: string,
  projectLabel: string,
  workflowStepId: string
) => {
  const nexus = useNexusContext();
  const [items, setItems] = React.useState<any[]>();
  const [headerProperties, setHeaderProperties] = React.useState<any[]>([]);

  const viewId = 'graph';

  const activitiesQuery = `
    PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    SELECT ?self ?resource ?name ?createdBy ?createdAt ?used ?generated
    WHERE {
      ?resource nxv:self ?self ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                nxv:createdBy ?createdBy ;
                nxv:createdAt ?createdAt ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
      <${workflowStepId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
                nxv:activities ?resource .
                
      OPTIONAL { ?resource <http://schema.org/name> ?name }
      OPTIONAL { ?resource prov:Generation|prov:generated|prov:wasGeneratedBy ?generated }
      OPTIONAL { ?resource prov:Usage|prov:used|prov:wasUsedBy ?used }
    }
    LIMIT 100
  `;

  React.useEffect(() => {
    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      activitiesQuery
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
        notification.error({
          message: 'Failed to fetch linked Activities',
          description: parseNexusError(error),
          top: distanceFromTopToDisplay,
        });
      });
  }, []);

  return {
    items,
    headerProperties,
  };
};

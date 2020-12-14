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

  const viewId = 'nxv:defaultSparqlIndex';

  const activitiesQuery = `
    PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    SELECT ?self ?resource ?name ?createdBy ?createdAt ?used ?generated ?resourceType
    WHERE {
      ?resource nxv:self ?self ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <prov:Activity> ;
                nxv:createdBy ?createdBy ;
                nxv:createdAt ?createdAt ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
      <${workflowStepId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
                nxv:activities ?resource .
                
      OPTIONAL { ?resource <http://schema.org/name> ?name }
      OPTIONAL { ?resource nxv:used ?used }
      OPTIONAL { ?resource nxv:generated ?generated }
    }
    LIMIT 100
  `;

  // query to fetch all activities in the project - saved for later
  const activitiesQueryTwo = `
    PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    SELECT  ?self ?activity ?createdAt ?createdBy ?used ?generated
    WHERE {
      ?activity nxv:self ?self ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                nxv:createdAt ?createdAt ;
                nxv:createdBy ?createdBy .
      OPTIONAL { ?activity nxv:used ?used }
      OPTIONAL { ?activity nxv:generated ?generated }
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
        displayError(error, 'Failed to fetch linked Activities');
      });
  }, []);

  return {
    items,
    headerProperties,
  };
};

import { SelectQueryResponse, SparqlViewQueryResponse } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import * as React from 'react';

import { distanceFromTopToDisplay, parseNexusError } from '../../../shared/hooks/useNotification';

const VIEW_ID = 'graph';

export type Item = {
  [key: string]: {
    datatype?: string;
    value: string;
    type: string;
  };
};

export type Input = {
  createdAt: string;
  name?: string;
  resourceId: string;
  types: string[];
  description?: string;
};

export const useInputs = (orgLabel: string, projectLabel: string, workflowStepId: string) => {
  const nexus = useNexusContext();
  const [inputs, setInputs] = React.useState<Input[]>([]);

  React.useEffect(() => {
    fetchInputs();
  }, [orgLabel, projectLabel, workflowStepId]);

  const fetchInputs = () => {
    const inputsQuery = `
			PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
			PREFIX prov: <http://www.w3.org/ns/prov#>
			SELECT ?resource ?createdAt ?name ?description ?resourceType
			WHERE {
					?resource nxv:createdAt ?createdAt ;
									<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
					<${workflowStepId}> nxv:inputs ?resource .
					OPTIONAL { ?resource <http://schema.org/name> ?name }
					OPTIONAL { ?resource <http://schema.org/description> ?description }
			}
			LIMIT 100
    `;

    nexus.View.sparqlQuery(orgLabel, projectLabel, encodeURIComponent(VIEW_ID), inputsQuery)
      .then((result: SparqlViewQueryResponse) => {
        const data: SelectQueryResponse = result as SelectQueryResponse;

        // we have to do this because sparql duplicates bindings when inputs have multiple types -
        // creates an entry for each type in the list
        const uniqueInputs = [
          ...new Set(data.results.bindings.map((input: Item) => input.resource.value)),
        ];

        const parsedList = Array.from(uniqueInputs).map((inputId: string) => {
          const allInputEntries = data.results.bindings.filter(
            (input) => input.resource.value === inputId
          );

          const types = allInputEntries.map((entry) => entry.resourceType.value);

          return {
            types,
            createdAt: allInputEntries[0].createdAt.value,
            name: allInputEntries[0]?.name?.value || 'No name',
            resourceId: allInputEntries[0].resource.value,
            description: allInputEntries[0]?.description?.value || 'No description',
          };
        });

        setInputs(parsedList);
      })
      .catch((error) => {
        notification.error({
          message: 'Failed to fetch Workflow Step inputs',
          description: parseNexusError(error),
          top: distanceFromTopToDisplay,
        });
      });
  };

  return {
    inputs,
    fetchInputs,
  };
};

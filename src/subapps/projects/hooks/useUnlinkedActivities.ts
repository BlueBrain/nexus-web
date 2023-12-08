import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import * as React from 'react';

import {
  distanceFromTopToDisplay,
  parseNexusError,
} from '../../../shared/hooks/useNotification';

export type UnlinkedActivity = {
  name?: string;
  resourceId: string;
  createdAt: string;
  createdBy: string;
  used?: string[];
  generated?: string[];
  resourceType: string | string[];
};

export const useUnlinkedActivities = (
  orgLabel: string,
  projectLabel: string
) => {
  const nexus = useNexusContext();
  const [unlinkedActivities, setUnlinkedActivities] = React.useState<
    UnlinkedActivity[]
  >([]);

  const unlinkedActivitiesQuery = `PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  SELECT ?resource ?name ?createdBy ?createdAt ?used ?generated ?resourceType
  WHERE {
    { ?resource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                  nxv:createdBy ?createdBy ;
                  nxv:createdAt ?createdAt ;
                  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType 
     OPTIONAL { ?resource <http://schema.org/name> ?name }
     OPTIONAL { ?resource nxv:used ?used }
     OPTIONAL { ?resource nxv:generated ?generated }
    } MINUS {
      ?wfstep <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
              nxv:activities ?resource .
    }
  }
  LIMIT 100`;

  React.useEffect(() => {
    fetchUnlinkedActivities();
  }, []);

  const fetchUnlinkedActivities = async () => {
    await nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(DEFAULT_SPARQL_VIEW_ID),
      unlinkedActivitiesQuery
    )
      .then((response: any) => {
        const activities: any[] = response.results.bindings.map(
          (activity: any) => ({
            name: activity.name ? activity.name.value : undefined,
            resourceId: activity.resource.value,
            createdAt: activity.createdAt.value,
            createdBy: activity.createdBy.value,
            used: activity.used ? activity.used.value : undefined,
            generated: activity.generated
              ? activity.generated.value
              : undefined,
            resourceType: activity.resourceType.value,
          })
        );

        const uniqueActivities = [
          ...new Set(
            response.results.bindings.map(
              (activity: any) => activity.resource.value
            )
          ),
        ];

        const parsedActivities: UnlinkedActivity[] = [];

        uniqueActivities.forEach(activity => {
          parsedActivities.push(
            activities
              .filter(data => data.resourceId === activity)
              .reduce(
                (acc, current) => {
                  if (current.name) {
                    acc.name = current.name;
                  }

                  if (current.createdAt) {
                    acc.createdAt = current.createdAt;
                  }

                  if (current.createdBy) {
                    acc.createdBy = current.createdBy;
                  }

                  if (current.generated) {
                    acc.generatedList.add(current.generated);
                  }

                  if (current.used) {
                    acc.usedList.add(current.used);
                  }

                  if (current.resourceId) {
                    acc.resourceId = current.resourceId;
                  }

                  if (current.resourceType) {
                    acc.resourceType.add(current.resourceType);
                  }

                  return acc;
                },
                {
                  name: '',
                  createdAt: '',
                  createdBy: '',
                  resourceId: '',
                  generatedList: new Set(),
                  usedList: new Set(),
                  resourceType: new Set(),
                }
              )
          );
        });

        setUnlinkedActivities(parsedActivities);
      })
      .catch(error => {
        notification.error({
          message: 'An error occurred while fetching detached activities',
          description: parseNexusError(error),
          top: distanceFromTopToDisplay,
        });
      });
  };

  return {
    unlinkedActivities,
    fetchUnlinkedActivities,
  };
};

import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';

import { displayError } from '../components/Notifications';

type UnlinkedActivity = {
  name: string;
  resourceId: string;
  createdAt: string;
  createdBy: string;
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
  SELECT ?resource ?name ?createdBy ?createdAt
  WHERE {
    { ?resource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
                <http://schema.org/name> ?name ;
                nxv:createdBy ?createdBy ;
                nxv:createdAt ?createdAt
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
      DEFAULT_SPARQL_VIEW_ID,
      unlinkedActivitiesQuery
    )
      .then((response: any) => {
        let activities;

        activities = response.results.bindings.map((activity: any) => ({
          name: activity.name.value,
          resourceId: activity.resource.value,
          createdAt: activity.createdAt.value,
          createdBy: activity.createdBy.value,
        }));

        setUnlinkedActivities(activities);
      })
      .catch(error => {
        displayError(
          error,
          'An error occurred while fetching detached activities'
        );
      });
  };

  return {
    unlinkedActivities,
  };
};

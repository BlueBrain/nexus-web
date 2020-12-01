import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';

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

  const projPrefix = `<https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/${orgLabel}/${projectLabel}/>`;

  const unlinkedActivitiesQuery = `PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
  PREFIX proj: ${projPrefix}
  SELECT ?resource ?name ?createdBy ?createdAt
  WHERE {
    { ?resource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> proj:FusionActivity ;
                proj:name ?name ;
                nxv:createdBy ?createdBy ;
                nxv:createdAt ?createdAt
    } MINUS { 
      ?wfstep <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> proj:WorkflowStep ;
              nxv:activities ?resource .
    }
  } 
  LIMIT 100`;

  React.useEffect(() => {
    fetchUnlinkedresources();
  }, []);

  const fetchUnlinkedresources = () => {
    nexus.View.sparqlQuery(
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
        // show error
      });
  };

  return {
    unlinkedActivities,
  };
};

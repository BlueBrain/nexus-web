import { notification } from 'antd';
import { DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';

/**
 * Makes a data table with a query to fetch inputs of a workflow.
 * @param stepId
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 */
export const makeInputTable = async (
  stepId: string,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => {
  const inputsQuery = `
			PREFIX nxv: <https://bluebrain.github.io/nexus/vocabulary/>
			PREFIX prov: <http://www.w3.org/ns/prov#>
			SELECT ?resource ?createdAt ?name ?description ?resourceType
			WHERE {
					?resource nxv:createdAt ?createdAt ;
									<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
					<${stepId}> nxv:inputs ?resource .
					OPTIONAL { ?resource <http://schema.org/name> ?name }
					OPTIONAL { ?resource <http://schema.org/description> ?description }
			}
			LIMIT 100
    `;
  const activityTable = {
    '@context': 'https://bluebrainnexus.io/workflowStep/table-context',
    '@type': 'FusionTable',
    configuration: [
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'subject',
      },
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'predicate',
      },
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'object',
      },
    ],
    dataQuery: inputsQuery,
    description: 'Default Input table',
    enableDownload: true,
    enableInteractiveRows: true,
    enableSave: true,
    enableSearch: true,
    name: 'InputTable',
    resultsPerPage: 10,
    tableOf: {
      '@id': stepId,
    },
    view: DEFAULT_SPARQL_VIEW_ID,
  };
  try {
    await nexus.Resource.create(orgLabel, projectLabel, activityTable);
    notification.success({ message: 'Created Input table successfully' });
  } catch (ex) {
    notification.error({ message: 'Failed to create Input table' });
  }
};

/**
 * Makes a data table with a query to fetch activities of a workflow.
 * @param stepId
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 */
export const makeActivityTable = async (
  stepId: string,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => {
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
      <${stepId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
                nxv:activities ?resource .
                
      OPTIONAL { ?resource <http://schema.org/name> ?name }
      OPTIONAL { ?resource prov:Generation|prov:generated|prov:wasGeneratedBy ?generated }
      OPTIONAL { ?resource prov:Usage|prov:used|prov:wasUsedBy ?used }
    }
    LIMIT 100
  `;
  const activityTable = {
    '@context': 'https://bluebrainnexus.io/workflowStep/table-context',
    '@type': 'FusionTable',
    configuration: [
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'subject',
      },
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'predicate',
      },
      {
        '@type': 'FusionTableColumn',
        enableFilter: false,
        enableSearch: true,
        enableSort: true,
        format: 'Text',
        name: 'object',
      },
    ],
    dataQuery: activitiesQuery,
    description: 'Default Activity table',
    enableDownload: true,
    enableInteractiveRows: true,
    enableSave: true,
    enableSearch: true,
    name: 'Activity Table',
    resultsPerPage: 10,
    tableOf: {
      '@id': stepId,
    },
    view: DEFAULT_SPARQL_VIEW_ID,
  };
  try {
    await nexus.Resource.create(orgLabel, projectLabel, activityTable);
    notification.success({ message: 'Created activity table successfully' });
  } catch (ex) {
    notification.error({ message: 'Failed to create activity table' });
  }
};

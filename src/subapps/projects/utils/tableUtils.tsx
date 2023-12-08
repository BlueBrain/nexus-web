import { DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk/es';
import { notification } from 'antd';

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
  SELECT ?self ?resource ?name ?description ?CreatedBy ?CreationDate (group_concat(distinct ?resourceType;separator=", ") as ?resourceTypes)
  WHERE {
    ?resource nxv:self ?self ;
                nxv:createdBy ?createdBy ;
                nxv:createdAt ?CreationDate ;
                <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
    BIND (STR(?createdBy) AS ?createdBy_str) .
      <${stepId}> nxv:input ?resource .
      OPTIONAL { ?resource <http://schema.org/name> ?name } .
      OPTIONAL { ?resource <http://schema.org/description> ?description } .
  }
  GROUP BY ?self ?resource ?name ?description (STRAFTER(?createdBy_str, "users/") AS ?CreatedBy) ?CreationDate
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
SELECT ?self ?resource ?ActivityName ?CreatedBy ?CreationDate (group_concat(distinct ?UsedDataset;separator=", ") as ?UsedDatasets) (group_concat(distinct ?GeneratedDataset;separator=", ") as ?GeneratedDatasets)
WHERE {
	?resource nxv:self ?self ;
			  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> prov:Activity ;
			  nxv:createdBy ?createdBy ;
			  nxv:createdAt ?CreationDate ;
			  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?resourceType .
  	BIND (STR(?createdBy) AS ?createdBy_str) .
			  <${stepId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> nxv:WorkflowStep ;
			  nxv:activities ?resource .  
      OPTIONAL { ?resource <http://schema.org/name> ?ActivityName } .
      OPTIONAL { ?resource prov:Generation|prov:generated|prov:wasGeneratedBy ?generated_id .
               ?generated_id <http://schema.org/name> ?GeneratedDataset .} .
      OPTIONAL { ?resource prov:Usage|prov:used|prov:wasUsedBy ?used_id .
               ?used_id <http://schema.org/name> ?UsedDataset .} .
}
GROUP BY ?self ?resource ?ActivityName (STRAFTER(?createdBy_str, "users/") AS ?CreatedBy) ?CreationDate

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

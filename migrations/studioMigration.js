import { createNexusClient } from '@bbp/nexus-sdk/es';
import fetch from 'node-fetch';
import minimist from 'minimist';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const STUDIO_RESULTS_DEFAULT_SIZE = 1000;

export const WORKFLOW_STEP_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/workflowStep/',
      '@vocab': 'https://bluebrainnexus.io/workflowStep/vocabulary/',
      nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
      input: 'nxv:input',
      activity: 'nxv:activity',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/workflowStep-context',
};

export const FUSION_TABLE_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/fusionTable/',
      '@vocab': 'https://bluebrainnexus.io/fusionTable/vocabulary/',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/table-context',
};

/**
 *
 * @param {*} projectId
 * @returns
 */
function getOrgAndProjectFromProjectId(projectId) {
  const [projectLabel, orgLabel, ...rest] = projectId.split('/').reverse();
  return {
    orgLabel,
    projectLabel,
  };
}

/**
 *
 * @param {*} userOrg
 * @param {*} name
 * @param {*} nexus
 */
export const createWorkflowStepContext = async (userOrg, name, nexus) => {
  try {
    await nexus.Resource.create(userOrg, name, {
      ...WORKFLOW_STEP_CONTEXT,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const checkForContext = async (nexus, orgLabel, projectLabel) => {
  try {
    await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(WORKFLOW_STEP_CONTEXT['@id'])
    );
  } catch (ex) {
    if (ex['@type'] === 'ResourceNotFound') {
      try {
        createWorkflowStepContext(orgLabel, projectLabel, nexus);
        createTableContext(orgLabel, projectLabel, nexus);
      } catch {
        throw new Error(error);
      }
    }
  }
  return true;
};

export const createTableContext = async (userOrg, name, nexus) => {
  try {
    await nexus.Resource.create(userOrg, name, {
      ...FUSION_TABLE_CONTEXT,
    });
  } catch (error) {
    throw new Error(error);
  }
  return true;
};

/**
 *
 * @param {*} labelString
 * @returns
 */
function camelCaseToLabelString(labelString) {
  return (
    labelString
      // insert a space before all caps
      .replace(/([A-Z])/g, ' $1')
      // upper case the first character
      .replace(/^./, str => str.toUpperCase())
      // remove potential white spaces from both sides of the string
      .trim()
  );
}

/**
 *
 * @param {*} studioId
 * @param {*} orgLabel
 * @param {*} projectLabel
 * @returns
 */
async function getStudio(studioId, orgLabel, projectLabel, nexus) {
  try {
    const studio = await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(studioId)
    );
    return studio;
  } catch (ex) {
    console.log(ex);
  }

  return {};
}
/**
 *
 * @param {*} workspaceId
 * @param {*} orgLabel
 * @param {*} projectLabel
 * @param {*} nexus
 * @returns
 */
async function getWorkSpace(workspaceId, orgLabel, projectLabel, nexus) {
  const workspace = await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspaceId)
  );
  return workspace;
}

/**
 *
 * @param {} dashboardId
 * @param {*} orgLabel
 * @param {*} projectLabel
 * @param {*} nexus
 * @returns
 */
async function getDashBoard(dashboardId, orgLabel, projectLabel, nexus) {
  const db = await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(dashboardId)
  );
  return db;
}

/**
 *
 * @param {NewType} dashboard
 * @param {*} newDataTable
 * @param {*} orgLabel
 * @param {*} projectLabel
 */
async function updateDashboard(
  dashboard,
  newDataTable,
  orgLabel,
  projectLabel,
  nexus
) {
  const resource = await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(dashboard['@id'])
  );
  const newResource = {
    ...resource,
    dataTable: {
      '@id': newDataTable['@id'],
    },
  };
  delete newResource.dataQuery;

  const updatedResource = await nexus.Resource.update(
    orgLabel,
    projectLabel,
    encodeURIComponent(dashboard['@id']),
    resource._rev,
    newResource
  );
  console.info(
    `resourceId:${resource['@id']}  orgLabel:${orgLabel}  projectLabel:${projectLabel} revision:${resource._rev}`
  );
  return updatedResource;
}

/**
 *
 * @param {*} nexus
 * @param {*} dataQuery
 * @param {*} view
 * @returns
 */
const sparqlQueryExecutor = async (nexus, dataQuery, view) => {
  const { org: orgLabel, project: projectLabel } = parseURL(view._self);
  const viewId = view['@id'];

  try {
    const data = await nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      dataQuery
    );

    const tempHeaderProperties = data.head.vars
      .filter(
        // we don't want to display total or self url in result table
        headVar => !(headVar === 'total' || headVar === 'self')
      )
      .map(headVar => ({
        title: camelCaseToLabelString(headVar),
        dataIndex: headVar,
      }));
    const headerProperties = tempHeaderProperties;
    // build items

    const items = data.results.bindings
      // we only want resources
      .filter(binding => binding.self)
      .map((binding, index) => {
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
  } catch (ex) {
    console.log(ex);
    return {
      items: [],
      headerProperties: [],
    };
  }
};
/***
 *
 */
async function querySparql(nexus, dataQuery, view) {
  const result = await sparqlQueryExecutor(nexus, dataQuery, view);

  const headerProperties = result.headerProperties;

  const items = result.items;
  return { headerProperties, items, total: items.length };
}

const nexusEntities = [
  'orgs',
  'projects',
  'acls',
  'views',
  'resources',
  'resolvers',
  'storages',
  'files',
];
const nexusUrlRegex = new RegExp(
  [
    '^',
    '(https?://.+)', // nexus deployment
    '/',
    '(v[1-9]+)', // api verison number
    '/',
    `(${nexusEntities.join('|')})`, // entity type
    '/',
    '([^/]+)', // org
    '/',
    '([^/]+)', // proj
    '/?',
    '([^/]+)?', // schema [optional]
    '/?',
    '([^/]+)?', // id [optional]
    '/?',
    '$',
  ].join('')
);

/**
 *
 * @param {*} nexusUrl
 * @returns
 */
function parseURL(nexusUrl) {
  if (!nexusUrl) throw new Error('selfUrl should be defined');

  const matches = nexusUrl.match(nexusUrlRegex);

  if (!matches || matches.length <= 5) {
    throw new Error('Error while parsing selfUrl');
  }

  if (matches[7] === undefined) {
    // we don't have a schema in this case because the self url was constructed via a
    // non-resource path such as views
    const [url, deployment, apiVersion, entityType, org, project, id] = matches;
    return {
      url,
      deployment,
      apiVersion,
      entityType,
      org,
      project,
      id,
    };
  }
  const [
    url,
    deployment,
    apiVersion,
    entityType,
    org,
    project,
    schema,
    id,
  ] = matches;

  return {
    url,
    deployment,
    apiVersion,
    entityType,
    org,
    project,
    schema,
    id,
  };
}
/**
 *
 * @param {*} view
 * @param {*} query
 * @param {*} orgLabel
 * @param {*} projectLabel
 * @returns
 */
async function getConfig(view, query, orgLabel, projectLabel, nexus) {
  const viewResource = await nexus.View.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(view)
  );
  let result;
  try {
    result = await querySparql(nexus, query, viewResource);

    return result.headerProperties
      .sort((a, b) => {
        return a.title > b.title ? 1 : -1;
      })
      .map(x => ({
        '@type': 'text',
        name: x.dataIndex,
        format: '',
        enableSearch: true,
        enableSort: true,
        enableFilter: true,
      }));
  } catch (ex) {
    console.error(ex);
  }
}

/**
 *
 * @param {*} workspace
 * @param {*} dashboardId
 */
async function updateWorkspace(
  workspace,
  dashboardToChange,
  orgLabel,
  projectLabel,
  nexus
) {
  const resource = await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspace['@id'])
  );

  const dashboards = [...resource.dashboards];
  for (let i = 0; i < dashboards.length; i++) {
    if (dashboards[i].dashboard === dashboardToChange.dashboard) {
      dashboards.splice(i, 1);
      dashboards.push({
        dashboard: dashboardToChange.dashboard,
      });
      break;
    }
  }
  resource.dashboards = dashboards;

  const updatedResource = await nexus.Resource.update(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspace['@id']),
    resource._rev,
    {
      ...resource,
      dashboards,
    }
  );
  console.info(
    `resourceId:${resource['@id']}  orgLabel:${orgLabel}  projectLabel:${projectLabel} revision:${resource._rev}`
  );
  return updatedResource;
}

/**
 *
 * @param {*} view
 * @param {*} query
 * @param {*} orgLabel
 * @param {*} projectLabel
 * @returns
 */
async function createDataTable(
  view,
  query,
  orgLabel,
  projectLabel,
  dashboard,
  nexus
) {
  const configuration = await getConfig(
    view,
    query,
    orgLabel,
    projectLabel,
    nexus
  );

  const data = {
    view,
    configuration,
    name: dashboard.label,
    '@context': 'https://bluebrainnexus.io/workflowStep/table-context',
    '@type': 'FusionTable',
    dataQuery: query,
    enableDownload: true,
    enableInteractiveRows: true,
    enableSave: true,
    enableSearch: true,
    resultsPerPage: 5,
  };
  const resource = await nexus.Resource.create(orgLabel, projectLabel, data);
  return resource;
}

/**
 *
 * @param { string } uri
 * @param { string } token
 * @param { node-fetch} fetch
 * @returns
 */

export function initNexusClient(uri, token, fetch) {
  return createNexusClient({
    uri,
    fetch,
    token,
  });
}

/**
 *
 * @param {string} studioId
 * @param {string} orgLabel
 * @param {string} projectLabel
 * @param {NexusClient} nexus
 */

export async function performMigrationforAStudio(
  studioId,
  orgLabel,
  projectLabel,
  nexus
) {
  try {
    let studio = await getStudio(studioId, orgLabel, projectLabel, nexus);
    const workspaces = studio.workspaces;
    console.group(studio.label);
    console.info(`Start migrating studio: ${studio.label}`);
    if (workspaces) {
      for (let i = 0; i < workspaces.length; i++) {
        let workspace = await getWorkSpace(
          workspaces[i],
          orgLabel,
          projectLabel,
          nexus
        );
        const dashboards = workspace.dashboards;

        for (let j = 0; j < dashboards.length; j++) {
          const view = dashboards[j].view;
          if (view) {
            try {
              const viewResource = await nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(view)
              );

              // Skip ES Dashboards
              if (
                viewResource['@type']?.includes('ElasticSearchView') ||
                viewResource['@type']?.includes('AggregateElasticSearchView')
              ) {
                continue;
              }
              const dashboard = await getDashBoard(
                dashboards[j].dashboard,
                orgLabel,
                projectLabel,
                nexus
              );
              console.info(`Migrating dashboard : ${dashboard.label}`);
              let query = dashboard.dataQuery;
              await checkForContext(nexus, orgLabel, projectLabel);
              let newDataTable = await createDataTable(
                view,
                query,
                orgLabel,
                projectLabel,
                dashboard,
                nexus
              );
              await updateDashboard(
                dashboard,
                newDataTable,
                orgLabel,
                projectLabel,
                nexus
              );
              await updateWorkspace(
                workspace,
                dashboards[j],
                orgLabel,
                projectLabel,
                nexus
              );
            } catch (ex) {
              console.error(ex);
              console.error(
                `Skip dashboard from worksapce: ${workspace.label}`
              );
              continue;
            }
          } else {
            console.info(
              `Skip dashboard : ${dashboards[j].dashboard}, it is already in new format`
            );
          }
        }
      }
    }
    console.info(`Finished migrating studio : ${studio.label}`);
    console.groupEnd();
  } catch (ex) {
    console.log(ex);
    console.error(`Failed to migrate from studio : ${studioId}`);
    return false;
  }
  return true;
}

/**
 *
 */

const args = minimist(process.argv.slice(2));

if (args.uri && args.token) {
  const nexus = initNexusClient(args.uri.trim(), args.token.trim(), fetch);
  const allStudios = await nexus.Resource.list(undefined, undefined, {
    size: STUDIO_RESULTS_DEFAULT_SIZE,
    deprecated: false,
    type: DEFAULT_STUDIO_TYPE,
  });
  const results = allStudios._results;
  console.info(`Start mirgating ${results.length} studios`);
  for (let i = 0; i < results.length; i++) {
    const studioId = results[i]['@id'];
    try {
      const labels = getOrgAndProjectFromProjectId(results[i]._project);
      await performMigrationforAStudio(
        studioId,
        labels.orgLabel,
        labels.projectLabel,
        nexus
      );
    } catch (ex) {
      console.error(ex);
      console.info(`falied to migrate ${studioId}`);
    }
  }
  console.info(`Finished mirgating ${results.length} studios`);
}

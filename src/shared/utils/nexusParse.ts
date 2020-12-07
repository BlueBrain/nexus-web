interface ParsedNexusUrl {
  url: string;
  deployment: string;
  apiVersion: string;
  entityType: string;
  org: string;
  project: string;
  schema?: string;
  id: string;
}

const nexusEntities = [
  'orgs',
  'projects',
  'acls',
  'views',
  'resources',
  'files',
];

const nexusUrlR = new RegExp(
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
 * With given Nexus URL (might be self/project/id url), return it's:
 * * deployment URL
 * * entity type
 * * org label
 * * project label
 * * id
 *
 * @param nexusUrl
 */
export const parseURL = (nexusUrl: string): ParsedNexusUrl => {
  if (!nexusUrl) throw new Error('selfUrl should be defined');

  const matches = nexusUrl.match(nexusUrlR);
  if (!matches || matches.length <= 5) {
    throw new Error('Error while parsing selfUrl');
  }

  if (matches[7] === undefined) {
    // we dont have a schema in this case because the self url was cosntructed via a
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
};

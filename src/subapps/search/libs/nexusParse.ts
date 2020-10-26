interface ParsedNexusUrl {
  deployment: string;
  entityType: string;
  org: string;
  project: string;
  schema: string;
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

  const mulEntityTypeR = new RegExp(`(${nexusEntities.join('|')})`, 'g');
  const mulEntityTypeMatch = nexusUrl.match(mulEntityTypeR);
  if (mulEntityTypeMatch && mulEntityTypeMatch.length > 1) {
    throw new Error(
      'Url contains multiple entity types which is not supported'
    );
  }

  const matches = nexusUrl.match(nexusUrlR);
  if (!matches || matches.length <= 5) {
    throw new Error('Error while parsing selfUrl');
  }

  return {
    deployment: matches[1],
    entityType: matches[2].slice(0, -1),
    org: matches[3],
    project: matches[4],
    schema: matches[5],
    id: matches[6],
  };
};

import { NexusClient, Resource, ResourceLink } from '@bbp/nexus-sdk/es';

import { labelOf } from '../../../shared/utils';
import fusionConfig from '../config';
import { StepResource } from '../types';

/**
 * isParentLink function - checks if a link created with a property 'hasParent'
 * @param {Object}
 * @returns {boolean}
 */
export const isParentLink = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return link.paths.filter((path: string) => labelOf(path) === 'hasParent').length > 0;
  }

  return labelOf(link.paths) === 'hasParent';
};

/**
 * isTable function - checks if a link has a property 'tableOf'
 * @param {Object}
 * @returns {boolean}
 */
export const isTable = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return link.paths.filter((path: string) => labelOf(path).indexOf('tableOf') >= 0).length > 0;
  }

  return labelOf(link.paths) === 'tableOf';
};

/**
 * isSubClass function - checks if a link resource is linked by path "subClassOf"
 * @param {Object}
 * @returns {boolean}
 */
export const isSubClass = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return link.paths.filter((path: string) => labelOf(path) === 'subClassOf').length > 0;
  }

  return labelOf(link.paths) === 'subClassOf';
};

/**
 * isActivityResource function - checks if a given link is a code snippet resource or notes
 * @param {Object}
 * @returns {boolean}
 */
export const isActivityResourceLink = (link: ResourceLink) => {
  if (Array.isArray(link['@type'])) {
    return (
      link['@type'].filter(
        (path: string) => labelOf(path) === 'Entity' || labelOf(path) === 'Agent'
      ).length > 0
    );
  }

  if (link && link['@type']) {
    return labelOf(link['@type']) === 'Entity' || labelOf(link['@type']) === 'Agent';
  }

  return null;
};

/**
 * isEmptyInput function - checks if a given input empty
 * @param {string}
 * @returns {boolean}
 */
export const isEmptyInput = (value: string) => {
  return value.split(' ').join('') === '';
};

/**
 * parse the context and get the 'base' URI of the resource.
 *
 * @param workflowStep
 */

export function createWorkflowBase(workflowStep: Resource) {
  let base;
  if (Array.isArray(workflowStep['@context'])) {
    const context = workflowStep['@context'] as {
      [key: string]: any;
    }[];
    base = context[0]['@base'];
  } else {
    base = workflowStep['@context'];
  }
  return base;
}

/**
 * Fetch all children of a given work flow step, represented by the stepId param.
 *
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 * @param stepId
 */
export async function fetchChildrenForStep(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  stepId: string
) {
  const links = await nexus.Resource.links(
    orgLabel,
    projectLabel,
    encodeURIComponent(stepId),
    'incoming',
    {
      deprecated: false,
    }
  );

  const children = ((await Promise.all(
    links._results
      .filter((link) => isParentLink(link))
      .map((step) => nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(step['@id'])))
    // additional filter as ResouceListOptions deprecated option not working
  )) as Resource[]).filter((resource) => !resource._deprecated);

  return children;
}

/**
 * Fetch all tables of a given work flow step, represented by the stepId param.
 *
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 * @param stepId
 */
export async function fetchTablesForStep(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  stepId: string
) {
  const links = await nexus.Resource.links(
    orgLabel,
    projectLabel,
    encodeURIComponent(stepId),
    'incoming',
    {
      deprecated: false,
    }
  );
  const uniq = [
    ...new Set(links._results.filter((link) => isTable(link)).map((link) => link['@id'])),
  ];
  const children = ((await Promise.all(
    uniq.map(async (step) => {
      const resource = await nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(step));
      return resource;
    })
    // additional filter as ResouceListOptions deprecated option not working
  )) as Resource[]).filter((resource) => !resource._deprecated);
  return children;
}

/**
 * Fetch all workflow steps in a project.
 *
 * @param nexus {NexusClient}
 * @param orgLabel  {string}
 * @param projectLabel {string}
 */
export async function fetchTopLevelSteps(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) {
  const allSteps = await nexus.Resource.list(orgLabel, projectLabel, {
    type: fusionConfig.workflowStepType,
    size: 99,
    deprecated: false,
  });

  const children = (await Promise.all(
    allSteps._results.map((step: any) => {
      return nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(step['@id']));
    })
  )) as StepResource[];

  return children;
}

/**
 * Returns user org label
 *
 * @param realm {string}
 * @param userName {string}
 * @returns {string}
 */
export const userOrgLabel = (realm?: string, userName?: string) => {
  return `${fusionConfig.personalOrgPrefix}${realm}-${userName}`;
};

import { labelOf } from '../../../shared/utils';
import { ResourceLink, Resource, NexusClient } from '@bbp/nexus-sdk';
import fusionConfig from '../config';

/**
 * isParentLink function - checks if a link created with a property 'hasParent'
 * @param {Object}
 * @returns {boolean}
 */
export const isParentLink = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return (
      link.paths.filter((path: string) => labelOf(path) === 'hasParent')
        .length > 0
    );
  }

  return labelOf(link.paths) === 'hasParent';
};

/**
 * isSubClass function - checks if a link resource is linked by path "subClassOf"
 * @param {Object}
 * @returns {boolean}
 */
export const isSubClass = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return (
      link.paths.filter((path: string) => labelOf(path) === 'subClassOf')
        .length > 0
    );
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
        (path: string) =>
          labelOf(path) === 'Entity' || labelOf(path) === 'Agent'
      ).length > 0
    );
  }

  if (link && link['@type']) {
    return (
      labelOf(link['@type']) === 'Entity' || labelOf(link['@type']) === 'Agent'
    );
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
    'incoming'
  );

  const children = await Promise.all(
    links._results
      .filter(link => isParentLink(link))
      .map(async step => {
        const resource = await nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(step['@id'])
        );
        return resource;
      })
  );
  return children;
}

export async function fetchTopLevelSteps(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) {
  const allSteps = await nexus.Resource.list(orgLabel, projectLabel, {
    type: fusionConfig.workflowStepType,
    size: 200,
    deprecated: false,
  });

  const children = await Promise.all(
    allSteps._results.map((step: any) => {
      return nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(step['@id'])
      );
    })
  );

  return children;
}

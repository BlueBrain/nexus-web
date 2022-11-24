import { ResourceLink, Resource, NexusClient } from '@bbp/nexus-sdk';
/**
 * isParentLink function - checks if a link created with a property 'hasParent'
 * @param {Object}
 * @returns {boolean}
 */
export declare const isParentLink: (link: ResourceLink) => boolean;
/**
 * isTable function - checks if a link has a property 'tableOf'
 * @param {Object}
 * @returns {boolean}
 */
export declare const isTable: (link: ResourceLink) => boolean;
/**
 * isSubClass function - checks if a link resource is linked by path "subClassOf"
 * @param {Object}
 * @returns {boolean}
 */
export declare const isSubClass: (link: ResourceLink) => boolean;
/**
 * isActivityResource function - checks if a given link is a code snippet resource or notes
 * @param {Object}
 * @returns {boolean}
 */
export declare const isActivityResourceLink: (
  link: ResourceLink
) => boolean | null;
/**
 * isEmptyInput function - checks if a given input empty
 * @param {string}
 * @returns {boolean}
 */
export declare const isEmptyInput: (value: string) => boolean;
/**
 * parse the context and get the 'base' URI of the resource.
 *
 * @param workflowStep
 */
export declare function createWorkflowBase(workflowStep: Resource): any;
/**
 * Fetch all children of a given work flow step, represented by the stepId param.
 *
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 * @param stepId
 */
export declare function fetchChildrenForStep(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  stepId: string
): Promise<
  Resource<{
    [key: string]: any;
  }>[]
>;
/**
 * Fetch all tables of a given work flow step, represented by the stepId param.
 *
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 * @param stepId
 */
export declare function fetchTablesForStep(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  stepId: string
): Promise<
  Resource<{
    [key: string]: any;
  }>[]
>;
/**
 * Fetch all workflow steps in a project.
 *
 * @param nexus {NexusClient}
 * @param orgLabel  {string}
 * @param projectLabel {string}
 */
export declare function fetchTopLevelSteps(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
): Promise<
  Resource<{
    hasParent?:
      | {
          '@id': string;
        }
      | undefined;
    activityType?: string | undefined;
    name: string;
    _self: string;
    status: import('../types').Status;
    description?: string | undefined;
    summary?: string | undefined;
    dueDate?: string | undefined;
    wasInformedBy?:
      | {
          '@id': string;
        }
      | undefined;
    used?:
      | {
          '@id': string;
        }
      | undefined;
    wasAssociatedWith?:
      | {
          '@id': string;
        }
      | {
          '@id': string;
        }[]
      | undefined;
    contribution?:
      | {
          agent: {
            '@id': string;
          };
        }
      | undefined;
    positionX?: number | undefined;
    positionY?: number | undefined;
  }>[]
>;
/**
 * Returns user org label
 *
 * @param realm {string}
 * @param userName {string}
 * @returns {string}
 */
export declare const userOrgLabel: (
  realm?: string | undefined,
  userName?: string | undefined
) => string;

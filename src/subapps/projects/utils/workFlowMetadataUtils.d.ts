import { ProjectMetadata } from '../components/ProjectForm';
import { NexusClient } from '@bbp/nexus-sdk';
/**
 *
 * @param userOrg
 * @param name
 * @param nexus
 */
export declare const createWorkflowStepContext: (
  userOrg: string,
  name: string,
  nexus: NexusClient
) => Promise<void>;
/**
 *
 * @param userOrg
 * @param name
 * @param nexus
 */
export declare const createTableContext: (
  userOrg: string,
  name: string,
  nexus: NexusClient
) => Promise<void>;
/**
 *
 * @param userOrg
 * @param data
 * @param realm
 * @param nexus
 */
export declare const createProject: (
  userOrg: string,
  data: ProjectMetadata,
  realm: string | undefined,
  nexus: NexusClient
) => Promise<void>;
/**
 *
 * @param userOrg
 * @param name
 * @param data
 * @param nexus
 */
export declare const createResource: (
  userOrg: string,
  name: string,
  data: ProjectMetadata,
  nexus: NexusClient
) => Promise<void>;

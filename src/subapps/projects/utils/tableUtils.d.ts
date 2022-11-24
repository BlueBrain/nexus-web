import { NexusClient } from '@bbp/nexus-sdk';
/**
 * Makes a data table with a query to fetch inputs of a workflow.
 * @param stepId
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 */
export declare const makeInputTable: (
  stepId: string,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => Promise<void>;
/**
 * Makes a data table with a query to fetch activities of a workflow.
 * @param stepId
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 */
export declare const makeActivityTable: (
  stepId: string,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => Promise<void>;

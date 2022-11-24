import { NexusClient } from '@bbp/nexus-sdk/lib/types';
/**
 * Use specific resource endpoints when we have a "@type"
 * with a specific Nexus resource type. If no specific
 * Nexus resource then will default to the resource
 * endpoint.
 * @param nexus
 * @param revision
 * @param resource
 * @param originalResource
 * @param orgLabel
 * @param projectLabel
 * @param resourceId
 * @returns Nexus SDK function to call to perform update to resource
 */
export declare const getUpdateResourceFunction: (
  nexus: NexusClient,
  revision: number,
  resource: any,
  originalResource: any,
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => any;

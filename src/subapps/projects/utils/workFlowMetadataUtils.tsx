import { ProjectMetadata } from '../components/ProjectForm';
import { Exception } from 'handlebars';
import { NexusClient } from '@bbp/nexus-sdk/es';
import {
  WORKFLOW_STEP_CONTEXT,
  FUSION_TABLE_CONTEXT,
  PROJECT_METADATA_CONTEXT,
} from '../fusionContext';
import { TErrorWithType } from '../../../utils/types';
import fusionConfig from '../config';


/**
 *
 * @param userOrgLabel
 * @param name
 * @param realm
 * @param nexus
 */
const makeProjectPublic = async (
  userOrgLabel: string,
  name: string,
  realm: string | undefined,
  nexus: NexusClient
) => {
  try {
    const currentACL = await nexus.ACL.list(`${userOrgLabel}/${name}`);
    const rev = currentACL._results[0] ? currentACL._results[0]._rev : 0;
    await nexus.ACL.append(`${userOrgLabel}/${name}`, rev, {
      acl: [
        {
          permissions: ['resources/read', 'projects/read', 'projects/write'],
          identity: {
            realm,
          },
        },
      ],
    });
  } catch (error) {
    throw new Exception(error as string);
  }
};
/**
 *
 * @param userOrg
 * @param data
 * @param realm
 * @param nexus
 */
const createOrganization = async (
  userOrg: string,
  data: ProjectMetadata,
  realm: string | undefined,
  nexus: NexusClient
) => {
  try {
    await nexus.Organization.create(userOrg, {
      description: 'Personal projects storage',
    });
    createProject(userOrg, data, realm, nexus);
  } catch (error) {
    throw new Exception(error as string);
  }
};
/**
 *
 * @param userOrg
 * @param name
 * @param nexus
 */
export const createWorkflowStepContext = async (
  userOrg: string,
  name: string,
  nexus: NexusClient
) => {
  try {
    await nexus.Resource.create(userOrg, name, {
      ...WORKFLOW_STEP_CONTEXT,
    });
  } catch (error) {
    throw new Exception(error as string);
  }
};
/**
 *
 * @param userOrg
 * @param name
 * @param nexus
 */
export const createTableContext = async (
  userOrg: string,
  name: string,
  nexus: NexusClient
) => {
  try {
    await nexus.Resource.create(userOrg, name, {
      ...FUSION_TABLE_CONTEXT,
    });
  } catch (error) {
    throw new Exception(error as string);
  }
};
/**
 *
 * @param userOrg
 * @param data
 * @param realm
 * @param nexus
 */
export const createProject = async (
  userOrg: string,
  data: ProjectMetadata,
  realm: string | undefined,
  nexus: NexusClient
) => {
  try {
    const { name, description, type, visibility } = data;
    await nexus.Project.create(userOrg, name, {
      description,
      apiMappings: fusionConfig.defaultAPIMappings,
    });

    createResource(userOrg, name, data, nexus);
    createWorkflowStepContext(userOrg, name, nexus);
    createTableContext(userOrg, name, nexus);
    if (type === 'personal' && visibility === 'public') {
      makeProjectPublic(userOrg, name, realm, nexus);
    }
  } catch (error) {
    if ((error as TErrorWithType)['@type'] === 'OrganizationNotFound') {
      createOrganization(userOrg, data, realm, nexus);
    } else {
      throw new Exception(error as string);
    }
  }
};
/**
 *
 * @param userOrg
 * @param name
 * @param data
 * @param nexus
 */
export const createResource = async (
  userOrg: string,
  name: string,
  data: ProjectMetadata,
  nexus: NexusClient
) => {
  try {
    await nexus.Resource.create(userOrg, name, {
      ...PROJECT_METADATA_CONTEXT,
    });
    await nexus.Resource.create(userOrg, name, {
      '@type': fusionConfig.fusionProjectTypes,
      '@context': PROJECT_METADATA_CONTEXT['@id'],
      ...data,
    });
  } catch (error) {
    throw new Exception(error as string);
  }
};

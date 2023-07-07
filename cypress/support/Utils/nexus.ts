import { NexusClient, ResourcePayload } from '@bbp/nexus-sdk';

export const createNexusOrgAndProject = async ({
  nexus,
  orgLabel,
  orgDescription,
  projectLabel,
  projectDescription,
}: {
  nexus: NexusClient;
  orgLabel: string;
  orgDescription: string;
  projectLabel: string;
  projectDescription: string;
}) => {
  // Create Org if does not exist
  try {
    const org = await nexus.Organization.get(orgLabel);

    if (org._deprecated) {
      throw new Error('Org deprecated');
    }
  } catch (e) {
    await nexus.Organization.create(orgLabel, {
      description: orgDescription,
    });
  }

  // Create project if does not exist
  try {
    await nexus.Project.get(orgLabel, projectLabel);
  } catch (e) {
    await nexus.Project.create(orgLabel, projectLabel, {
      description: projectDescription,
    });
  }
};

export const deprecateNexusOrgAndProject = async ({
  nexus,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
}) => {
  // Deprecate project
  try {
    const project = await nexus.Project.get(orgLabel, projectLabel);
    await nexus.Project.deprecate(orgLabel, projectLabel, project._rev);
  } catch (e) {
    console.error('Encountered an error whilst trying to deprecate project', e);
  }
};

export const createResource = async ({
  nexus,
  orgLabel,
  projectLabel,
  resource,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  resource: ResourcePayload;
}) => await nexus.Resource.create(orgLabel, projectLabel, resource);

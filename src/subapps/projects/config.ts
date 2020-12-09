// const nxv = 'https://bluebrain.github.io/nexus/vocabulary/';
// const prov = 'http://www.w3.org/ns/prov#';

export const fusionConfig = {
  // org and project to store application data
  configOrg: 'webapps',
  configProject: 'nexus-web',

  // prefix for the org to store personal projects 'prefix-username'
  personalOrgPrefix: 'fusion-',

  // resource types
  workflowStepType: 'nxv:WorkflowStep',
  activityWorkflowLink: 'nxv:activities',
  templateType: 'FusionTemplate',
  activityType: 'prov:Activity',
  projectMetadataType: 'FusionMetadata',
  fusionProjectTypes: ['FusionMetadata', 'FusionProject'],
  codeType: ['SoftwareSourceCode', 'Entity'],
  noteType: ['FusionNote', 'Entity'],
  agentOrgType: ['Agent', 'Organization'],
  agentPersonType: ['Agent', 'Person'],
};

export default fusionConfig;

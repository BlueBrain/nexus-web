const fusionConfig = {
  // org and project to store application data
  configOrg: 'webapps',
  configProject: 'nexus-web',

  // prefix for the org to store personal projects 'prefix-username'
  personalOrgPrefix: 'fusion-',

  // resource types
  templateType: 'FusionTemplate',
  activityType: 'FusionActivity',
  projectMetadataType: 'FusionMetadata',
  fusionProjectTypes: ['FusionMetadata', 'FusionProject'],
  codeType: ['SoftwareSourceCode', 'Entity'],
  noteType: 'FusionNote',
};

export default fusionConfig;

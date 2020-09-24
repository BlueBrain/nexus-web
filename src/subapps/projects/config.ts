const fusionConfig = {
  // org and project to store application data
  configOrg: 'webapps',
  configProject: 'nexus-web',

  // prefix for the org to store personal projects 'prefix-username'
  personalOrgPrefix: 'fusion2-',

  // resource types
  templateType: 'FusionTemplate',
  activityType: 'FusionActivity',
  projectMetadataType: 'FusionMetadata',
  fusionProjectTypes: ['FusionMetadata', 'FusionProject'],
};

export default fusionConfig;

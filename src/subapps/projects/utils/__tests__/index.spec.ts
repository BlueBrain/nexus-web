import { ResourceLink } from '@bbp/nexus-sdk';

import { isActivityResourceLink, isParentLink, isSubClass, userOrgLabel } from '..';

const linkToSibling: ResourceLink = {
  '@id': '123',
  '@type': 'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity',
  //  TODO: we should update link type in nexus-sdk! as paths can be a string and an array
  // @ts-ignore
  paths: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/wasInformedBy',
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-09-24T12:51:33.626Z',
  _createdBy: 'stafeeva',
  _deprecated: false,
  _project: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/89898',
  _rev: 6,
  _self:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/https:%2F%2Fstaging.nexus.ocp.bbp.epfl.ch%2Fv1%2Fresources%2Ffusion2-stafeeva%2F89898%2F_%2Fdc8db4a2-9579-427b-abbc-8a686016d212',
  _updatedAt: '2020-09-30T12:24:20.144Z',
  _updatedBy: 'stafeeva',
};

const linkToParent: ResourceLink = {
  '@id':
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/f0c149ec-9d3c-49f9-bc06-dd57a8053220',
  '@type': 'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity',
  paths: ['https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/hasParent'],
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-09-23T08:10:45.115Z',
  _createdBy: 'stafeeva',
  _deprecated: false,
  _project: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/89898',
  _rev: 2,
  _self:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/https:%2F%2Fstaging.nexus.ocp.bbp.epfl.ch%2Fv1%2Fresources%2Ffusion2-stafeeva%2F89898%2F_%2Ff0c149ec-9d3c-49f9-bc06-dd57a8053220',
  _updatedAt: '2020-09-28T09:20:21.340Z',
  _updatedBy: 'stafeeva',
};

const linkToActivityResource: ResourceLink = {
  '@id': 'ff161f5a-6e77-48d7-b7f6-fe5fa5a97382',
  '@type': ['FusionCode', 'Entity'],
  paths: [
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/wasAssociatedWith',
  ],
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-10-06T14:57:20.064Z',
  _createdBy: 'me',
  _deprecated: false,
  _project: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/89898',
  _rev: 2,
  _self: '...',
  _updatedAt: '2020-10-06T15:01:49.024Z',
  _updatedBy: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/stafeeva',
};

const linkToNotes: ResourceLink = {
  '@id': 'b3c5f79f-278c-4e05-989e-d1fd2aac7793',
  '@type': ['FusionNote', 'Entity'],
  paths: ['https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/used'],
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-10-06T13:10:44.641Z',
  _createdBy: 'me',
  _deprecated: false,
  _project: '89898',
  _rev: 1,
  _self: '...',
  _updatedAt: '2020-10-06T13:10:44.641Z',
  _updatedBy: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/stafeeva',
};

const subClassLink: ResourceLink = {
  '@id': 'https://bluebrain.github.io/nexus/vocabulary/SomeOtherResourceTwo',
  '@type': 'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/datamodels-test/Class',
  paths: ['http://www.w3.org/2000/01/rdf-schema#subClassOf'],
  _self:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/datamodels-test/_/nxv:SomeOtherResourceTwo',
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _project: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/datamodels-test',
  _rev: 2,
  _deprecated: false,
  _createdAt: '2021-01-06T10:53:16.012Z',
  _createdBy: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/stafeeva',
  _updatedAt: '2021-01-07T09:13:52.080Z',
  _updatedBy: 'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/stafeeva',
};

describe('isParent', () => {
  it('should check if it is a link to parent', () => {
    expect(isParentLink(linkToSibling)).toEqual(false);
    expect(isParentLink(linkToParent)).toEqual(true);
  });
});

describe('isActivityResource', () => {
  it('should check if it is a link to an activity resource (notes, code, etc)', () => {
    expect(isActivityResourceLink(linkToSibling)).toEqual(false);
    expect(isActivityResourceLink(linkToParent)).toEqual(false);
    expect(isActivityResourceLink(linkToActivityResource)).toEqual(true);
    expect(isActivityResourceLink(linkToNotes)).toEqual(true);
  });
});

describe('isSubClass', () => {
  it("checks if link's path is subClassOf", () => {
    expect(isSubClass(subClassLink)).toEqual(true);
  });
});

describe('userOrgLabel', () => {
  it('constructs user org label', () => {
    expect(userOrgLabel('testrealm', 'user')).toEqual('fusion-testrealm-user');
  });
});

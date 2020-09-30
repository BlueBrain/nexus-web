import { isParentLink } from '..';
import { ResourceLink } from '@bbp/nexus-sdk';

const linkToSibling: ResourceLink = {
  '@id': '123',
  '@type':
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity',
  //  TODO: we should updates links type in nexus-sdk! as paths can be a string and an array
  // @ts-ignore
  paths:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/wasInformedBy',
  _constrainedBy:
    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-09-24T12:51:33.626Z',
  _createdBy: 'stafeeva',
  _deprecated: false,
  _project:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/89898',
  _rev: 6,
  _self:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/https:%2F%2Fstaging.nexus.ocp.bbp.epfl.ch%2Fv1%2Fresources%2Ffusion2-stafeeva%2F89898%2F_%2Fdc8db4a2-9579-427b-abbc-8a686016d212',
  _updatedAt: '2020-09-30T12:24:20.144Z',
  _updatedBy: 'stafeeva',
};

const linkToParent: ResourceLink = {
  '@id':
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/f0c149ec-9d3c-49f9-bc06-dd57a8053220',
  '@type':
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/FusionActivity',
  paths: [
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion2-stafeeva/89898/hasParent',
  ],
  _constrainedBy:
    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2020-09-23T08:10:45.115Z',
  _createdBy: 'stafeeva',
  _deprecated: false,
  _project:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/fusion2-stafeeva/89898',
  _rev: 2,
  _self:
    'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion2-stafeeva/89898/_/https:%2F%2Fstaging.nexus.ocp.bbp.epfl.ch%2Fv1%2Fresources%2Ffusion2-stafeeva%2F89898%2F_%2Ff0c149ec-9d3c-49f9-bc06-dd57a8053220',
  _updatedAt: '2020-09-28T09:20:21.340Z',
  _updatedBy: 'stafeeva',
};

describe('isChild', () => {
  it('should check if it is a link to parent', () => {
    expect(isParentLink(linkToSibling)).toEqual(false);
    expect(isParentLink(linkToParent)).toEqual(true);
  });
});

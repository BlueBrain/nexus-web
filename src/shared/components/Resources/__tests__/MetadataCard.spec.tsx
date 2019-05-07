import * as React from 'react';
import { mount } from 'enzyme';
import MetadataCard from '../MetadataCard';
import { Resource, NexusFile } from '@bbp/nexus-sdk';

jest.mock('moment', () => () => ({
  format: () => '20/03/2019',
  fromNow: () => 'some days ago',
}));

const mockResourceResponse = {
  '@context': '',
  '@id': 'https://incf.github.io/neuroshapes/contexts/schema.json',
  _self:
    'https://api.com/resources/anorg/testcore/https%3A%2F%2Fincf.github.io%2Fnexus%2Fneuroshapes%2Fcontexts%2Fschema.json',
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/resource.json',
  _project: 'https://api.com/projects/anorg/testcore',
  _createdAt: '2018-11-14T21:16:54.230Z',
  _createdBy: 'kenny',
  _updatedAt: '2018-11-15T08:40:52.735Z',
  _updatedBy: 'kenny',
  _rev: 2,
  _deprecated: false,
};

describe('MetadataCard component', () => {
  it('should render with Unknown username', () => {
    const resource = new Resource('anorg', 'testcore', mockResourceResponse);
    // @ts-ignore
    resource.createdBy = '';
    const metadataCardProps = {
      resource,
      getFilePreview: async (selfUrl: string) =>
        await NexusFile.getSelf(selfUrl),
    };
    const wrapper = mount(<MetadataCard {...metadataCardProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with Set username', () => {
    const resource = new Resource('anorg', 'testcore', mockResourceResponse);
    // @ts-ignore
    resource.createdBy = 'Julien';
    const metadataCardProps = {
      resource,
      getFilePreview: async (selfUrl: string) =>
        await NexusFile.getSelf(selfUrl),
    };
    const wrapper = mount(<MetadataCard {...metadataCardProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with an extracted username', () => {
    const resource = new Resource('anorg', 'testcore', mockResourceResponse);
    // @ts-ignore
    resource.createdBy = 'http://user.com/julien';
    const metadataCardProps = {
      resource,
      getFilePreview: async (selfUrl: string) =>
        await NexusFile.getSelf(selfUrl),
    };
    const wrapper = mount(<MetadataCard {...metadataCardProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

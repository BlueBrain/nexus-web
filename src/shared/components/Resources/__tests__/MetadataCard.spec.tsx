import * as React from 'react';
import { mount } from 'enzyme';
import MetadataCard from '../MetadataCard';

jest.mock('moment', () => () => ({
  format: () => '20/03/2019',
  fromNow: () => 'some days ago',
}));

const metadataCardProps = {
  createdAt: '2019-03-20T09:41:57.248Z',
  updatedAt: '2019-03-20T10:00:20.260Z',
  rev: 12,
  id: '9756a96b-a053-4bc1-9fc9-7620c9c08bc',
  constrainedBy: 'http://schema.org',
  self: 'http://my.self',
  key: 'unique',
};
describe('MetadataCard component', () => {
  it('should render with Unknown username', () => {
    const wrapper = mount(<MetadataCard createdBy="" {...metadataCardProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with Set username', () => {
    const wrapper = mount(
      <MetadataCard createdBy="Julien" {...metadataCardProps} />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with an extracted username', () => {
    const wrapper = mount(
      <MetadataCard createdBy="http://user.com/julien" {...metadataCardProps} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});

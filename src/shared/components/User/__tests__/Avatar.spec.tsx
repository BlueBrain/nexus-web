import * as React from 'react';
import { mount } from 'enzyme';
import Avatar from '../Avatar';

describe('Avatar component', () => {
  it('should render with Unknown username', () => {
    const wrapper = mount(<Avatar createdBy="" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with a set username', () => {
    const wrapper = mount(<Avatar createdBy="Julien" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with an extracted username', () => {
    const wrapper = mount(<Avatar createdBy="http://created.by/julien" />);
    expect(wrapper).toMatchSnapshot();
  });
});

import * as React from 'react';
import { shallow, mount } from 'enzyme';
import Header, { HeaderProps } from '..';

const links: React.ReactNode[] = [
  <p>A p tag</p>,
  <a href="/somepage">A link to some page</a>,
];

const shallowHeader = shallow(
  <Header name="Mark Hamill" links={links} githubIssueURL="" version="" />
);
const wrapper = mount(
  <Header name="Mark Hamill" links={links} githubIssueURL="" version="" />
);

describe('Header component', () => {
  it('Should render correctly', () => {
    expect(shallowHeader).toMatchSnapshot();
  });

  it('Should have a logo block and a menu block', () => {
    expect(shallowHeader.find('.logo-block')).toBeTruthy();
    expect(shallowHeader.find('.menu-block')).toBeTruthy();
  });

  describe('Logo Block', () => {
    it('Should diplay the Nexus logo followed by the App name', () => {
      expect(wrapper.find('.logo')).toBeTruthy();
      expect(wrapper.find('h1').text()).toEqual('Nexus');
    });
  });

  describe('Menu Block', () => {
    it('Should display the user name followed by a space', () => {
      expect(wrapper.find('.menu-dropdown').text()).toEqual('Mark Hamill ');
    });

    it('Should display login link', () => {
      wrapper.setProps({ name: '' });
      expect(wrapper.find('.menu-dropdown').text()).toEqual('login ');
    });

    it('Should NOT display login link', () => {
      wrapper.setProps({ displayLogin: false });
      expect(wrapper.find('.menu-dropdown').children()).toHaveLength(0);
    });
  });
});

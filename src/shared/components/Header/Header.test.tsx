import React = require('react');
import { shallow, mount } from 'enzyme';
import Header, { HeaderProps } from '.';

const links: React.ReactNode[] = [
  <p>A p tag</p>,
  <a href="/somepage">A link to some page</a>,
];

const shallowHeader = shallow(<Header name="Mark Hamill" links={links} />);
const fullDOMHeader = mount(<Header name="Mark Hamill" links={links} />);

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
      expect(fullDOMHeader.find('.logo-block').children()).toHaveLength(2);
      expect(fullDOMHeader.find('.logo')).toBeTruthy();
      expect(fullDOMHeader.find('h1').text()).toEqual('Nexus');
    });
  });

  describe('Menu Block', () => {
    it('Should display the user name followed by a space', () => {
      expect(fullDOMHeader.find('.menu-dropdown').text()).toEqual(
        'Mark Hamill '
      );
    });
  });
});

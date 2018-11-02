import React = require('react');
import { shallow, render } from 'enzyme';
import Header, { HeaderProps } from '.';

const links: React.ReactNode[] = [
  <p>lol</p>,
];

describe('Header component', () => {
  it('Should render correctly', () => {
    const tree = shallow(<Header name="Mark Hamil" links={links} />);
    expect(tree).toMatchSnapshot();
  });
});

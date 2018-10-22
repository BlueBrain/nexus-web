import React = require('react');
import { shallow, render } from 'enzyme';
import Header, { LinkProp } from '../Header';

const links: LinkProp[] = [
  {
    name: 'lol',
    url: '/lol',
  },
];

describe('Header component', () => {
  it('Should render correctly', () => {
    const tree = shallow(<Header links={links} />, { context: {} });
    expect(tree).toMatchSnapshot();
  });
});

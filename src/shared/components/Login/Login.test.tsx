import React = require('react');
import { shallow, mount } from 'enzyme';

import Login from './index';

const shallowLogin = shallow(<Login loginURL="https://keycloack.com" />);
const fullDOMLogin = mount(<Login loginURL="https://keycloack.com" />);

describe('login component', () => {
  it('should render correctly', () => {
    expect(shallowLogin).toMatchSnapshot();
  });

  it('should have an anchor tag with correct href attribute', () => {
    expect(fullDOMLogin.find('a')).toBeTruthy();
    expect(
      fullDOMLogin
        .find('a')
        .getDOMNode()
        .getAttribute('href')
    ).toEqual('https://keycloack.com');
  });
});

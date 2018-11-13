import React = require('react');
import { shallow, mount } from 'enzyme';

import Login from './index';

const authProvider = 'https://keycloack.org';
const loginComponent = <Login loginURL={authProvider} />;
const shallowLogin = shallow(loginComponent);
const fullDOMLogin = mount(loginComponent);

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
    ).toEqual(authProvider);
  });
});

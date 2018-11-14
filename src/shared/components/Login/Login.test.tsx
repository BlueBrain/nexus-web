import React = require('react');
import { shallow, mount } from 'enzyme';

import Login, { Realm } from './index';

const authProvider = 'https://keycloack.org';
const realms: Realm[] = [
  {
    name: 'BBP',
    authorizationEndpoint:
      'https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth',
  },
  {
    name: 'HBP',
    authorizationEndpoint:
      'https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth',
  },
  {
    name: 'Google',
    authorizationEndpoint:
      'https://accounts.google.com/.well-known/openid-configuration',
  },
];
const loginComponent = <Login realms={realms} />;
const shallowLogin = shallow(loginComponent);
const fullDOMLogin = mount(loginComponent);

describe('login component', () => {
  it('should render correctly', () => {
    expect(shallowLogin).toMatchSnapshot();
  });

  it('should have an anchor tag and href attribute should be first Realm', () => {
    expect(fullDOMLogin.find('a')).toBeTruthy();
    expect(
      fullDOMLogin
        .find('a')
        .getDOMNode()
        .getAttribute('href')
    ).toEqual(realms[0].authorizationEndpoint);
  });
});

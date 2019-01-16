import * as React from 'react';
import { mount } from 'enzyme';

import Login, { Realm } from '../index';

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
const loginComponent = (
  <Login clientId="nexus-web" hostName="http://nexus" realms={[realms[1]]} />
);
const wrapper = mount(loginComponent);

describe('login component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('with only 1 realm', () => {
    it('anchor tag text should just be Log in', () => {
      expect(wrapper.find('a.link')).toHaveLength(1);
    });
    it('href attribute should be second Realm', () => {
      expect(
        wrapper
          .find('a.link')
          .getDOMNode()
          .getAttribute('href')
      ).toEqual(
        `${
          realms[1].authorizationEndpoint
        }?client_id=nexus-web&response_type=token&scope=openid&nonce=123456&redirect_uri=http://nexus/authRedirect`
      );
    });

    it('anchor tag text should only display Log in', () => {
      expect(wrapper.find('a.link').text()).toEqual('Log in ');
    });
  });

  describe('with more than 1 realm', () => {
    beforeAll(() => {
      // change props and pass all realms
      wrapper.setProps({ realms });
    });

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('should have an anchor tag', () => {
      expect(wrapper.find('a.link')).toHaveLength(1);
    });

    it('href attribute should be second Realm still', () => {
      expect(
        wrapper
          .find('a.link')
          .getDOMNode()
          .getAttribute('href')
      ).toEqual(
        `${
          realms[1].authorizationEndpoint
        }?client_id=nexus-web&response_type=token&scope=openid&nonce=123456&redirect_uri=http://nexus/authRedirect`
      );
    });

    it("anchor tag text should display Realm's name", () => {
      expect(wrapper.find('a').text()).toEqual('Log in with HBP ');
    });
  });
});

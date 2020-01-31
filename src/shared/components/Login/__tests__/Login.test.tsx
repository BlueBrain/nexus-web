import * as React from 'react';
import { mount } from 'enzyme';

import Login from '../index';

const realms: string[] = ['BBP', 'HBP', 'Google'];
const loginComponent = <Login realms={[realms[1]]} />;
const wrapper = mount(loginComponent);

describe('login component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('with only 1 realm', () => {
    it('should have a login button', () => {
      expect(wrapper.find('button.login-button').text()).toEqual('Log in');
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

    it('should have a login button', () => {
      expect(wrapper.find('button.login-button').text()).toEqual('Log in');
    });

    it("a dropdown should show a Realm's name", () => {
      // There is an extra space appended to because of the dropdown Icon
      expect(wrapper.find('span.realm').text()).toEqual('HBP ');
    });
  });
});

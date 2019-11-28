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
    it('anchor tag text should just be Log in', () => {
      expect(wrapper.find('a.link')).toHaveLength(1);
    });

    it('anchor tag text should only display Log in', () => {
      expect(wrapper.find('span').first().text()).toEqual('Log in ');
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

    it('should have an anchor tag and an icon', () => {
      expect(wrapper.find('a.link')).toHaveLength(2);
    });

    it("a dropdown should show a Realm's name", () => {
      expect(wrapper.find('span.realm').text()).toEqual('HBP');
    });
  });
});

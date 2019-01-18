import * as React from 'react';
import { mount } from 'enzyme';
import OrgForm from '../OrgForm';

const formComponent = <OrgForm />;

const wrapper = mount(formComponent);
describe('Organisation Form component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

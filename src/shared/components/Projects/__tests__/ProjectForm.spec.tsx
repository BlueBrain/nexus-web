import * as React from 'react';
import { mount } from 'enzyme';
import ProjectForm from '../ProjectForm';

const formComponent = <ProjectForm />;

const wrapper = mount(formComponent);
describe('Project Form component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

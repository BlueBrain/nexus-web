import * as React from 'react';
import { mount } from 'enzyme';

// Need to mock Date.now() because it is used down the line
// to generate a per-element class, which break snapshot testing.
// Must be done before importing the React component.
jest.spyOn(Date, 'now').mockImplementation(() => 1234567890123);

import ProjectForm from '../ProjectForm';

const formComponent = <ProjectForm />;
const wrapper = mount(formComponent);

describe('Project Form component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

// Restoring Date.now() to the real thing, so as not to break other tests.
jest.restoreAllMocks();

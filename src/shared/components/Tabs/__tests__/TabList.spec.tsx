import * as React from 'react';
import { shallow } from 'enzyme';

import TabList from '../TabList';

const tabListComponent = <TabList items={[]} onSelected={jest.fn} />;
const wrapper = shallow(tabListComponent);

describe('TabList component', () => {
  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

jest.restoreAllMocks();

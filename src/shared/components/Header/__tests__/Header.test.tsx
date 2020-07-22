import * as React from 'react';
import { shallow, mount } from 'enzyme';
import Header, { ServiceVersions } from '..';
import { MemoryRouter } from 'react-router-dom';

const versions: ServiceVersions = {
  nexus: '1.0',
  admin: '1.0',
  blazegraph: '1.0',
  elasticsearch: '1.0',
  iam: '1.0',
  kg: '1.0',
  storage: 'asda',
};

jest.mock('react-redux', () => {
  const ActualReactRedux = require.requireActual('react-redux');
  return {
    ...ActualReactRedux,
    useSelector: jest.fn().mockImplementation(() => {
      return 'mockState';
    }),
  };
});

const links: React.ReactNode[] = [
  <p>A p tag</p>,
  <a href="/somepage">A link to some page</a>,
];

const shallowHeader = shallow(
  <Header
    name="Mark Hamill"
    links={links}
    githubIssueURL=""
    version=""
    serviceVersions={versions}
    onClickSideBarToggle={() => {}}
  />
);

const wrapper = mount(
  <MemoryRouter>
    <Header
      name="Mark Hamill"
      links={links}
      githubIssueURL=""
      version=""
      serviceVersions={versions}
      onClickSideBarToggle={() => {}}
    />
  </MemoryRouter>
);

describe('Header component', () => {
  it('Should render correctly', () => {
    expect(shallowHeader).toMatchSnapshot();
  });

  it('Should have a logo block and a menu block', () => {
    expect(shallowHeader.find('.logo-block')).toBeTruthy();
    expect(shallowHeader.find('.menu-block')).toBeTruthy();
  });

  describe('Menu Block', () => {
    it('Should display the user name followed by a space', () => {
      expect(wrapper.find('.menu-dropdown').text()).toEqual('Mark Hamill ');
    });

    it('Should display login link', () => {
      const wrapperNoName = mount(
        <MemoryRouter>
          <Header
            name=""
            links={links}
            githubIssueURL=""
            version=""
            serviceVersions={versions}
            onClickSideBarToggle={() => {}}
          />
        </MemoryRouter>
      );

      expect(wrapperNoName.find('.menu-dropdown').text()).toEqual('login ');
    });

    it('Should NOT display login link', () => {
      const wrapperNoLogin = mount(
        <MemoryRouter>
          <Header
            name=""
            links={links}
            githubIssueURL=""
            version=""
            serviceVersions={versions}
            displayLogin={false}
            onClickSideBarToggle={() => {}}
          />
        </MemoryRouter>
      );

      expect(wrapperNoLogin.find('.menu-dropdown').children()).toHaveLength(0);
    });
  });
});

import * as React from 'react';
import { shallow, mount } from 'enzyme';
import Header from '..';
import { MemoryRouter } from 'react-router-dom';

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
    realms={[]}
    serviceAccountsRealm="serviceaccounts"
    links={links}
    githubIssueURL=""
    forgeLink=""
    version=""
    performLogin={(name: string) => {}}
    subApps={[]}
    authenticated={false}
  />
);

const wrapper = mount(
  <MemoryRouter>
    <Header
      name="Mark Hamill"
      realms={[]}
      serviceAccountsRealm="serviceaccounts"
      links={links}
      githubIssueURL=""
      forgeLink=""
      version=""
      performLogin={(name: string) => {}}
      subApps={[]}
      authenticated={false}
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
            realms={[]}
            serviceAccountsRealm="serviceaccounts"
            links={links}
            githubIssueURL=""
            forgeLink=""
            version=""
            performLogin={(name: string) => {}}
            subApps={[]}
            authenticated={false}
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
            realms={[]}
            serviceAccountsRealm="serviceaccounts"
            links={links}
            githubIssueURL=""
            forgeLink=""
            version=""
            displayLogin={false}
            performLogin={(name: string) => {}}
            subApps={[]}
            authenticated={false}
          />
        </MemoryRouter>
      );

      expect(wrapperNoLogin.find('.menu-dropdown').children()).toHaveLength(0);
    });
  });
});

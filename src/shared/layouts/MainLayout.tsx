import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import Header from '../components/Header';
import getUserManager from '../../client/userManager';
import { version, url as githubIssueURL } from '../../../package.json';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { Realm } from '@bbp/nexus-sdk-legacy';
import { getLogoutUrl, getDestinationParam } from '../utils';
import { UserManager } from 'oidc-client';
import { RootState } from '../store/reducers';
import NavDrawerContainer from '../components/Menu/NavDrawer';
import { Button, Divider } from 'antd';
import RecentlyVisited from '../components/RecentlyVisited';
import { OrgResponseCommon, ProjectResponseCommon } from '@bbp/nexus-sdk';
import OrgList from '../components/Orgs/OrgList';
import OrgItem from '../components/Orgs/OrgItem';
import ListItem from '../components/List/Item';
import ProjectList from '../components/Projects/ProjectList';
import ProjectItem from '../components/Projects/ProjectItem';
import './MainLayout.less';

const favicon = require('../favicon.png');
const TITLE = 'A knowledge graph for data-driven science';
const DESCRIPTION =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
  authenticated: boolean;
  token?: string;
  goTo(url: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  name: string;
  canLogin?: boolean;
  userManager?: UserManager;
  userIdentity: Identity;
}

const MainLayout: React.FunctionComponent<MainLayoutProps> = ({
  authenticated,
  token,
  goTo,
  goToProject,
  name,
  children,
  canLogin = false,
  userManager,
  userIdentity,
}) => {
  const handleLogout = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" type="image/x-icon" href={favicon} />
        <title>{TITLE}</title>
        <meta id="app-description" name="description" content={DESCRIPTION} />
        <meta name="twitter:card" content={DESCRIPTION} />
        <meta name="twitter:site" content="@bluebrainnexus" />
        <meta
          property="og:image"
          content="https://bluebrain.github.io/nexus/assets/img/logo.png"
        />
        <meta property="og:image:width" content="745" />
        <meta property="og:image:height" content="745" />
        <meta property="og:site_name" content="Nexus" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="theme-color" content="#00c9fd" />
      </Helmet>
      <Header
        visitHome={() => goTo('/')}
        name={authenticated ? name : undefined}
        token={token}
        links={[
          <a
            href="/user"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault();
              goTo(`/user`);
            }}
          >
            User Info
          </a>,
          <a href="" onClick={handleLogout}>
            Log out
          </a>,
        ]}
        displayLogin={canLogin}
        onLoginClick={() => goTo(`/login${getDestinationParam()}`)}
        version={version}
        githubIssueURL={githubIssueURL}
      >
        <NavDrawerContainer
          routes={[
            {
              path: '/',
              component: (path, goTo) => {
                return (
                  <div className="page -home">
                    <p>Projects are where you group and categorize data</p>
                    <Button icon="project" onClick={() => goTo('/selectOrg')}>
                      Select a Project
                    </Button>
                    <Divider />
                    <RecentlyVisited visitProject={goToProject} />
                  </div>
                );
              },
            },
            {
              path: '/selectOrg',
              component: (path, goTo) => {
                return (
                  <div className="page -select-org">
                    <h4 className="title">
                      <Button
                        size="small"
                        onClick={() => goTo('/')}
                        icon="arrow-left"
                      ></Button>{' '}
                      Select an Organziation
                    </h4>
                    <OrgList>
                      {({ items }: { items: OrgResponseCommon[] }) =>
                        items.map(i => (
                          <ListItem
                            key={i['@id']}
                            onClick={() => goTo(`/selectProject/${i._label}`)}
                          >
                            <OrgItem {...i} />
                          </ListItem>
                        ))
                      }
                    </OrgList>
                  </div>
                );
              },
            },
            {
              path: '/selectProject/:orgLabel',
              component: (path, goTo, { orgLabel }) => {
                return (
                  <div className="page -select-project">
                    <h4 className="title">
                      <Button
                        size="small"
                        onClick={() => goTo('/')}
                        icon="arrow-left"
                      ></Button>{' '}
                      Select a Project
                    </h4>
                    <ProjectList orgLabel={orgLabel}>
                      {({ items }: { items: ProjectResponseCommon[] }) =>
                        items.map(i => (
                          <ListItem
                            key={i['@id']}
                            onClick={() =>
                              goToProject(i._organizationLabel, i._label)
                            }
                          >
                            <ProjectItem {...i} />
                          </ListItem>
                        ))
                      }
                    </ProjectList>
                  </div>
                );
              },
            },
          ]}
          defaultVisibility={false}
          render={(visible, toggleVisibility) => {
            return (
              <Button
                icon="project"
                size="small"
                onClick={() => toggleVisibility()}
              >
                Projects
              </Button>
            );
          }}
        ></NavDrawerContainer>
      </Header>
      <div className="MainLayout_body">{children}</div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, oidc } = state;
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data.results) || [];
  const identities: Identity[] =
    (auth.identities && auth.identities.data) || [];
  return {
    authenticated: oidc.user !== undefined,
    token: oidc.user && oidc.user.access_token,
    name: oidc.user && oidc.user.profile && oidc.user.profile.name,
    logoutUrl: getLogoutUrl(identities, realms),
    userIdentity: identities[identities.length - 1],
    canLogin: !!(realms.length > 0),
    userManager: getUserManager(state),
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (url: string) =>
    dispatch(push(url, { previousUrl: window.location.href })),
  goToProject: (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLayout);

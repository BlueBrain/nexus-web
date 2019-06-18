import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';

import Header from './index';
import OrgDropdown from '../Orgs/OrgDropdown';

storiesOf('Components/Header', module).add(
  'Header',
  withInfo(`
    The header component is used throughout the application.

    It is used to display the user name and navigation links

    ~~~js
      <Header
        name="Mark Hamill"
        links={[<a href="#">Log out</a>, <a href="#">Settings</a>]}
      />
      <Header onLoginClick={action('login-link-click')} />
      <Header displayLogin={false} />
    ~~~
  `)(() => (
    <React.Fragment>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>Name + menu + token</h2>
        <Header
          name="Mark Hamill"
          links={[<a href="#">Log out</a>, <a href="#">Settings</a>]}
          token="supercereal"
          githubIssueURL="some.url"
          version="v1.1.0"
        />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>Name + menu</h2>
        <Header
          name="Mark Hamill"
          links={[<a href="#">Log out</a>, <a href="#">Settings</a>]}
          children={<OrgDropdown />}
          githubIssueURL="some.url"
          version="v1.1.0"
        />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>No name + login link</h2>
        <Header
          onLoginClick={action('login-link-click')}
          githubIssueURL="some.url"
          version="v1.1.0"
        />
      </div>
      <div style={{ margin: '50px 40px 0px' }}>
        <h2>No name + no login link</h2>
        <Header
          displayLogin={false}
          githubIssueURL="some.url"
          version="v1.1.0"
        />
      </div>
    </React.Fragment>
  ))
);

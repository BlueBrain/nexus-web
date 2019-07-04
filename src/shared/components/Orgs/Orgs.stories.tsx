import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number, boolean } from '@storybook/addon-knobs';
import OrgItem, { OrgItemProps } from './OrgItem';
import OrgForm from './OrgForm';

const makeFakeOrg = () => {
  return {
    '@id': 'http://dev.nexus.ocp.bbp.epfl.ch/v1/orgs/asdf',
    '@type': 'Organization',
    description: 'this is a description',
    _createdAt: '2019-06-28T08:10:12.447662Z',
    _createdBy:
      'http://dev.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/kenjinp',
    _deprecated: false,
    _label: 'asdf',
    _rev: 1,
    _updatedAt: '2019-06-28T08:10:12.447662Z',
    _updatedBy:
      'http://dev.nexus.ocp.bbp.epfl.ch/v1/realms/github/users/kenjinp',
    _uuid: '645cf585-a209-4dc2-88ce-a47055132500',
  };
};

const orgs: OrgItemProps[] = [
  { label: 'nexus', numberOfProjects: 1200 },
  { label: 'bbp', numberOfProjects: 300 },
  { label: 'hbp', numberOfProjects: 1 },
  { label: 'nasa', numberOfProjects: 912839 },
  { label: 'tesla' },
  { label: 'rolex', numberOfProjects: 3424 },
];

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgItem',
    withInfo(`
    The Organization Card component is used across multiple components.
    It displays the the basic Organization informations.

    ~~~js
      <OrgItem />
    ~~~
  `)(() => {
      const label = text('Label', 'nexus');
      const projects = number('Project', 1);
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>No logo</h2>
            <OrgItem numberOfProjects={123} label="bbp" />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Logo and edit button</h2>
            <OrgItem
              label={label}
              numberOfProjects={projects}
              onClick={action('org-click')}
              onEdit={action('edit-button-click')}
            />
          </div>
        </React.Fragment>
      );
    })
  );

// storiesOf('Components/Orgs', module).add(
//   'OrgList',
//   withInfo(`
//     The Organization List component is capable of rendering a list of .....
//     It allows to filter Organizations by name.

//     ~~~js
//       <OrgList />
//     ~~~
//   `)(() => {
//     const [items, setItems] = React.useState([]);
//     const loadMore = () => console.log('');
//     const hasMore = boolean('hasMore', false);
//     const dataLength = number('dataLength', 0);

//     return (
//       <React.Fragment>
//         <div style={{ margin: '50px 40px 0px' }}>
//           <InfiniteSearch onLoadMore={loadMore} hasMore={hasMore}>
//             {items.map(i => (
//               <p>lol</p>
//             ))}
//           </InfiniteSearch>
//         </div>
//       </React.Fragment>
//     );
//   })
// );

storiesOf('Components/Orgs', module)
  .addDecorator(withKnobs)
  .add(
    'OrgForm',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return (
        <React.Fragment>
          <div style={{ margin: '50px 40px 0px' }}>
            <OrgForm />
          </div>
        </React.Fragment>
      );
    })
  );

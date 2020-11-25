import * as React from 'react';
import { Badge, Button, Popover } from 'antd';
import { BellOutlined } from '@ant-design/icons';

import NotififcationsPopover from '../components/NotificationsPopover';

const NotificationsContainer: React.FC<{}> = () => {
  // TODO: fetch activities https://github.com/BlueBrain/nexus/issues/1816
  const activities: any[] = [
    { name: 'Activity 1', createdOn: '1 may 2020', createdBy: 'stafeeva' },
    { name: 'Activity 2', createdOn: '1 may 2020', createdBy: 'dylanTheDog' },
    {
      name:
        'This is an activity with a very very very very very super long name',
      createdOn: '1 may 2020',
      createdBy: 'dylanTheDog',
    },
  ];

  // TODO: link an unlinked activity https://github.com/BlueBrain/nexus/issues/1817
  const linkActivity = () => {
    console.log('linkActivity');
  };

  // TODO: create a new step from an unlinked activity https://github.com/BlueBrain/nexus/issues/1818
  const addNew = () => {
    console.log('addNew');
  };

  return (
    <Popover
      placement="topLeft"
      title={
        <h3
          style={{ marginTop: '7px' }}
        >{`${activities.length} detached activities`}</h3>
      }
      content={
        <NotififcationsPopover
          activities={activities}
          onClickLinkActivity={linkActivity}
          onClickNew={addNew}
        />
      }
      trigger="click"
    >
      <Badge count={activities.length}>
        <Button
          icon={<BellOutlined style={{ color: 'inherit' }} />}
          shape="circle"
          style={{ marginLeft: '7px' }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationsContainer;

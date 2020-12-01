import * as React from 'react';
import { Badge, Button, Popover } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';

import NotififcationsPopover from '../components/NotificationsPopover';
import { useUnlinkedActivities } from '../hooks/useUnlinkedActivities';

const NotificationsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const { unlinkedActivities } = useUnlinkedActivities(orgLabel, projectLabel);

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
        >{`${unlinkedActivities.length} detached activities`}</h3>
      }
      content={
        <NotififcationsPopover
          activities={unlinkedActivities}
          onClickLinkActivity={linkActivity}
          onClickNew={addNew}
        />
      }
      trigger="click"
    >
      <Badge count={unlinkedActivities.length}>
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

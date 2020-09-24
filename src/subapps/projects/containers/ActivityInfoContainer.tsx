import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Button } from 'antd';

import { displayError } from '../components/Notifications';
import { ActivityResource } from '../views/ActivityView';

const ActivityInfoContainer: React.FC<{ activity: ActivityResource }> = ({
  activity,
}) => {
  const nexus = useNexusContext();

  console.log('activity', activity);

  return (
    <div>
      <Button>Activity Info</Button>
    </div>
  );
};

export default ActivityInfoContainer;

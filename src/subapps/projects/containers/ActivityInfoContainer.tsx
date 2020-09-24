import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, Button } from 'antd';

import { displayError } from '../components/Notifications';
import { ActivityResource } from '../views/ActivityView';
import ActivityForm from '../components/Activities/ActivityForm';

const ActivityInfoContainer: React.FC<{
  activity: ActivityResource;
  projectLabel: string;
  orgLabel: string;
}> = ({ activity, projectLabel, orgLabel }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  console.log('activity', activity);

  return (
    <div>
      <Button onClick={() => setShowForm(true)}>Activity Info</Button>
      <Drawer
        visible={showForm}
        destroyOnClose={true}
        onClose={() => setShowForm(false)}
        title="Edit Activity information"
        placement="right"
        closable
        width={600}
      >
        <ActivityForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={() => {}}
          busy={busy}
          parentLabel=""
          layout="vertical"
        />
      </Drawer>
    </div>
  );
};

export default ActivityInfoContainer;

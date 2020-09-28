import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Drawer, Button } from 'antd';

import { displayError, successNotification } from '../components/Notifications';
import { ActivityResource } from '../views/ActivityView';
import ActivityForm from '../components/Activities/ActivityForm';
import fusionConfig from '../config';

const ActivityInfoContainer: React.FC<{
  activity: ActivityResource;
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}> = ({ activity, projectLabel, orgLabel, onUpdate }) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [parentLabel, setParentLabel] = React.useState<string>();
  const [originalPayload, setOriginalPayload] = React.useState<
    ActivityResource
  >();

  React.useEffect(() => {
    nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(activity['@id'])
    )
      .then(response => setOriginalPayload(response as ActivityResource))
      .catch(error => displayError(error, 'Failed to load original payload'));
    if (activity.hasParent) {
      nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(activity.hasParent['@id'])
      )
        .then(response => {
          const parent = response as ActivityResource;
          setParentLabel(parent.name);
        })
        .catch(error => displayError(error, 'Failed to load parent activity'));
    }
  }, []);

  const updateActivity = (data: any) => {
    const parent = originalPayload && originalPayload.hasParent;

    if (parent && parent['@id']) {
      data.hasParent = parent;
    }

    nexus.Resource.update(
      orgLabel,
      projectLabel,
      activity['@id'],
      activity._rev,
      {
        ...data,
        '@type': fusionConfig.activityType,
      }
    )
      .then(response => {
        onUpdate();
        setShowForm(false);
        successNotification(`Activity ${data.name} updated successfully`);
      })
      .catch(error => displayError(error, 'Failed to update activity'));
  };

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
          onSubmit={updateActivity}
          busy={busy}
          parentLabel={parentLabel}
          layout="vertical"
          activity={activity}
        />
      </Drawer>
    </div>
  );
};

export default ActivityInfoContainer;

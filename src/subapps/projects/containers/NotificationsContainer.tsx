import * as React from 'react';
import { Badge, Button, Popover, Modal } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';

import NotififcationsPopover from '../components/NotificationsPopover';
import { useUnlinkedActivities } from '../hooks/useUnlinkedActivities';
import LinkActivityForm from '../components/LinkActivityForm';
import fusionConfig from '../config';

const NotificationsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const { unlinkedActivities } = useUnlinkedActivities(orgLabel, projectLabel);
  const [showLinkForm, setShowLinkForm] = React.useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = React.useState<any>();
  const [steps, setSteps] = React.useState<any[]>([]);
  const nexus = useNexusContext();

  const fetchActivities = (activities: any) => {
    Promise.all(
      activities.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    )
      .then(response => setSteps(response))
      .catch(error => {
        console.log('error');
      });
  };

  const onClickLinkActivity = (id: string) => {
    setSelectedActivity(
      unlinkedActivities.find(activity => activity.resourceId === id)
    );

    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.workflowStepType,
      size: 200,
      deprecated: false,
    })
      .then(response => {
        fetchActivities(response._results);
      })
      .catch(error => {
        console.log('error');
      });

    setShowLinkForm(true);
  };

  const linkActivity = (stepId: string) => {
    setShowLinkForm(false);
    console.log('yo! we need to link this activity to:', stepId);
  };

  // TODO: create a new step from an unlinked activity https://github.com/BlueBrain/nexus/issues/1818
  const addNew = () => {
    console.log('addNew');
  };

  const stepsList = steps.map(step => ({
    id: step['@id'],
    name: step.name,
  }));

  return (
    <>
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
            onClickLinkActivity={onClickLinkActivity}
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
      <Modal
        maskClosable
        visible={showLinkForm}
        footer={null}
        onCancel={() => setShowLinkForm(false)}
        width={600}
        destroyOnClose={true}
      >
        <LinkActivityForm
          activity={selectedActivity}
          stepsList={stepsList}
          onSubmit={linkActivity}
        />
      </Modal>
    </>
  );
};

export default NotificationsContainer;

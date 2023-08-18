import * as React from 'react';
import { Tooltip, Button, Popconfirm } from 'antd';
import { Resource } from '@bbp/nexus-sdk/es';

import './ResourceActions.scss';
import useNotification from '../../hooks/useNotification';

export type ActionType = {
  name: string; // A unique name for your action type
  // predicate: This function will be called with the resource passed
  // to test if we want to display this Action Button
  predicate: (resource: Resource) => Promise<boolean>;
  title: string; // A long title displayed on the confirm popup or tooltip
  shortTitle: string; // Displayed on Button
  // message: a longer message to be displayed on on the confirmation popup
  message?: React.ReactElement | string;
  icon: React.ReactElement | string; // An icon for the button
  danger?: boolean; // should we use a confirmation popup and color the button red?
};

const makeButton = ({
  title,
  icon,
  shortTitle,
  danger,
  message,
}: {
  title: string;
  icon: React.ReactElement | string;
  message?: React.ReactElement | string;
  shortTitle: string;
  danger?: boolean;
}) => (resource: Resource, actionToDispatch: () => void) => (
  <div className="action" key={`${resource['@id']}-${title}`}>
    {danger ? (
      <Popconfirm
        title={
          message ? message : 'Are you sure you want to perform this action?'
        }
        onConfirm={() => actionToDispatch && actionToDispatch()}
        okText="Yes"
        cancelText="No"
      >
        <Button danger icon={icon}>
          {shortTitle}
        </Button>
      </Popconfirm>
    ) : (
      <Tooltip title={title}>
        <Button
          icon={icon}
          onClick={() => actionToDispatch && actionToDispatch()}
        >
          {shortTitle}
        </Button>
      </Tooltip>
    )}
  </div>
);

const makeActionButtons = async (
  resource: Resource,
  actionDispatchers: {
    [key: string]: () => void;
  },
  actionTypes: ActionType[]
) => {
  const appliedActions = await Promise.all(
    actionTypes.map(async action => {
      return await action.predicate(resource);
    })
  );
  return actionTypes
    .filter((action, index) => appliedActions[index])
    .map(action =>
      makeButton(action)(resource, actionDispatchers[action.name])
    );
};

const ResourceActions: React.FunctionComponent<{
  resource: Resource;
  actions: {
    [key: string]: () => void;
  };
  actionTypes: ActionType[];
}> = props => {
  const { resource, actions, actionTypes } = props;
  const [actionButtons, setActionButtons] = React.useState<
    React.ReactElement[]
  >([]);
  const notification = useNotification();
  React.useEffect(() => {
    makeActionButtons(resource, actions, actionTypes)
      .then(setActionButtons)
      .catch((error: Error) => {
        notification.error({
          message:
            'There was an error while fetching information about this resource',
          description: error.message,
        });
      });
  }, [resource._self, resource._rev]);

  return <>{actionButtons}</>;
};

export default ResourceActions;

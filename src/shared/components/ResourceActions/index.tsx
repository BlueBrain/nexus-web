import * as React from 'react';
import { Tooltip, Button, Popconfirm, notification } from 'antd';
import { Resource } from '@bbp/nexus-sdk';

import './ResourceActions.less';

export type ActionType = {
  name: string;
  predicate: (resource: Resource) => Promise<boolean>;
  title: string;
  shortTitle: string;
  message?: React.ReactElement | string;
  icon: string;
  danger?: boolean;
};

const makeButton = ({
  title,
  icon,
  shortTitle,
  danger,
  message,
}: {
  title: string;
  icon: string;
  message?: React.ReactElement | string;
  shortTitle: string;
  danger?: boolean;
}) => (resource: Resource, actionToDispatch: () => void) => (
  <div className="action" key={`${resource.id}-${title}`}>
    {danger ? (
      <Popconfirm
        title={
          message ? message : 'Are you sure you want to perform this action?'
        }
        onConfirm={() => actionToDispatch && actionToDispatch()}
        okText="Yes"
        cancelText="No"
      >
        <Button type="danger" icon={icon}>
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

const makeActions = async (
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
  const filteredActions = actionTypes.filter(
    (action, index) => appliedActions[index]
  );

  return filteredActions.map(action =>
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

  React.useEffect(() => {
    makeActions(resource, actions, actionTypes)
      .then(setActionButtons)
      .catch((error: Error) => {
        notification.error({
          message:
            'There was an error while fetching information about this resource',
          description: error.message,
        });
      });
  }, [resource._self, resource._rev]);

  return <section className="resource-actions">{actionButtons}</section>;
};

export default ResourceActions;

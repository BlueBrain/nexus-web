import * as React from 'react';
import { Tooltip, Button, Popconfirm } from 'antd';
import './ResourceActions.less';
import {
  isFile,
  chainPredicates,
  not,
  isDefaultElasticView,
  isDeprecated,
  isView,
} from '../../utils/nexusMaybe';
import { Resource } from '@bbp/nexus-sdk';

const actionTypes = [
  {
    name: 'deprecateResource',
    predicate: chainPredicates([isDefaultElasticView, not(isDeprecated)]),
    title: 'Deprecate this resource',
    shortTitle: 'Dangerously Deprecate',
    message: (
      <div>
        <h3>Warning!</h3>
        <p>
          Deprecating this resource <em>WILL ABSOLUTELY</em> break this
          application for this project. Are you sure you want to deprecate it?
        </p>
      </div>
    ),
    icon: 'delete',
    danger: true,
  },
  {
    name: 'deprecateResource',
    predicate: chainPredicates([not(isDeprecated), not(isDefaultElasticView)]),
    title: 'Deprecate this resource',
    message: "Are you sure you'd like to deprecate this resource?",
    shortTitle: 'Deprecate',
    icon: 'delete',
    danger: true,
  },
  {
    name: 'goToView',
    predicate: isView,
    title: 'Query this view',
    shortTitle: 'Query',
    icon: 'search',
  },
  {
    name: 'downloadFile',
    predicate: isFile,
    title: 'Download this file',
    shortTitle: 'Download',
    icon: 'download',
  },
];

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

const makeActions = (
  resource: Resource,
  actionDispatchers: {
    [key: string]: () => void;
  }
) =>
  actionTypes
    .filter(action => action.predicate(resource))
    .map(action =>
      makeButton(action)(resource, actionDispatchers[action.name])
    );

const ResourceActions: React.FunctionComponent<{
  resource: Resource;
  actions: {
    [key: string]: () => void;
  };
}> = props => {
  const { resource, actions } = props;
  return (
    <section className="resource-actions">
      {makeActions(resource, actions)}
    </section>
  );
};

export default ResourceActions;

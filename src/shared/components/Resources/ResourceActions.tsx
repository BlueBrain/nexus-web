import * as React from 'react';
import { Card, Tooltip, Button, Popconfirm } from 'antd';
import { Resource } from '@bbp/nexus-sdk-legacy';
import './resource-actions.less';
import {
  isElasticView,
  isSparqlView,
  isFile,
  chainPredicates,
  not,
  isDefaultElasticView,
  isDeprecated,
} from '../../utils/nexus-maybe';
import { string } from 'prop-types';

const actionTypes = [
  {
    name: 'veryDangerousToDeprecate',
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
    name: 'goToElasticSearchView',
    predicate: isElasticView,
    title: 'Query this ElasticSearch view',
    shortTitle: 'Query',
    icon: 'search',
  },
  {
    name: 'goToSparqlView',
    predicate: isSparqlView,
    title: 'Query this Sparql view',
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
}) => (resource: Resource, actionToDispatch: (resource: Resource) => void) => (
  <div className="action" key={`${resource.id}-${title}`}>
    {danger ? (
      <Popconfirm
        title={
          message ? message : 'Are you sure you want to perform this action?'
        }
        onConfirm={() => actionToDispatch && actionToDispatch(resource)}
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
          onClick={() => actionToDispatch && actionToDispatch(resource)}
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
    [key: string]: (resource: Resource) => void;
  }
) =>
  actionTypes
    .filter(action => action.predicate(resource))
    .map(action =>
      makeButton(action)(resource, actionDispatchers[action.name])
    );

export interface ResourceActionsProps {
  resource: Resource;
  goToSparqlView: (resource: Resource) => void;
  goToElasticSearchView: (resource: Resource) => void;
  deprecateResource: (resource: Resource) => void;
  downloadFile: (resource: Resource) => void;
  veryDangerousToDeprecate: (resource: Resource) => void;
}

const ResourceActions: React.FunctionComponent<
  ResourceActionsProps
> = props => {
  const {
    resource,
    goToSparqlView,
    goToElasticSearchView,
    deprecateResource,
    downloadFile,
    veryDangerousToDeprecate,
  } = props;
  return (
    <section className="resource-actions">
      {makeActions(resource, {
        goToSparqlView,
        goToElasticSearchView,
        deprecateResource,
        downloadFile,
        veryDangerousToDeprecate,
      })}
    </section>
  );
};

export default ResourceActions;

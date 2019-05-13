import * as React from 'react';
import { Card, Tooltip, Button, Popconfirm } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import './resource-actions.less';

const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const SPARQL_VIEW = 'SparqlView';

const isOfType = (type: string) => (resource: Resource) =>
  !!resource.type && resource.type.includes(type);

const isNotDeprecated = (resource: Resource) => !resource.deprecated;
const isView = isOfType(VIEW);
const isElasticView = isOfType(ES_VIEW);
const isSparqlView = isOfType(SPARQL_VIEW);

const actionTypes = [
  {
    name: 'deprecateResource',
    predicate: isNotDeprecated,
    title: 'Deprecate this resource',
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
];

const makeButton = ({
  title,
  icon,
  shortTitle,
  danger,
}: {
  title: string;
  icon: string;
  shortTitle: string;
  danger?: boolean;
}) => (resource: Resource, actionToDispatch: (resource: Resource) => void) => (
  <div className="action" key={`${resource.id}-${title}`}>
    {danger ? (
      <Popconfirm
        title="Are you sure you'd like to deprecate this resource?"
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
      makeButton({
        shortTitle: action.shortTitle,
        title: action.title,
        icon: action.icon,
        danger: action.danger,
      })(resource, actionDispatchers[action.name])
    );

export interface ResourceActionsProps {
  resource: Resource;
  goToSparqlView: (resource: Resource) => void;
  goToElasticSearchView: (resource: Resource) => void;
  deprecateResource: (resource: Resource) => void;
}

const ResourceActions: React.FunctionComponent<
  ResourceActionsProps
> = props => {
  const {
    resource,
    goToSparqlView,
    goToElasticSearchView,
    deprecateResource,
  } = props;
  return (
    <section className="resource-actions">
      {makeActions(resource, {
        goToSparqlView,
        goToElasticSearchView,
        deprecateResource,
      })}
    </section>
  );
};

export default ResourceActions;

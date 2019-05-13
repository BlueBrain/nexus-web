import * as React from 'react';
import { Card, Tooltip, Button } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import './resource-actions.less';

const VIEW = 'View';
const ES_VIEW = 'ElasticSearchView';
const SPARQL_VIEW = 'SparqlView';

const isOfType = (type: string) => (resource: Resource) =>
  !!resource.type && resource.type.includes(type);

const exists = (something: any) => !!something;
const isDeprecated = (resource: Resource) => resource.deprecated;
const isView = isOfType(VIEW);
const isElasticView = isOfType(ES_VIEW);
const isSparqlView = isOfType(SPARQL_VIEW);

const actionTypes = [
  {
    name: 'deprecateResource',
    predicate: exists,
    title: 'Deprecate this resource',
    icon: 'delete',
  },
  {
    name: 'goToElasticSearchView',
    predicate: isElasticView,
    title: 'Query this ElasticSearch view',
    icon: 'search',
  },
  {
    name: 'goToSparqlView',
    predicate: isSparqlView,
    title: 'Query this Sparql view',
    icon: 'search',
  },
];

const makeButton = ({
  title,
  icon,
  name,
}: {
  title: string;
  icon: string;
  name: string;
}) => (resource: Resource, actionToDispatch: (resource: Resource) => void) => (
  <Tooltip title={title}>
    <Button
      icon={icon}
      onClick={() => actionToDispatch && actionToDispatch(resource)}
    />
  </Tooltip>
);

const makeActions = (
  resource: Resource,
  actionDispatchers: {
    goToSparqlView: (resource: Resource) => void;
    goToElasticSearchView: (resource: Resource) => void;
    [key: string]: any;
  }
) =>
  actionTypes
    .filter(action => action.predicate(resource))
    .map(action =>
      makeButton({
        title: action.title,
        icon: action.icon,
        name: action.name,
      })(resource, actionDispatchers[action.name])
    );

export interface ResourceActionsProps {
  resource: Resource;
  goToSparqlView: (resource: Resource) => void;
  goToElasticSearchView: (resource: Resource) => void;
}

const ResourceActions: React.FunctionComponent<
  ResourceActionsProps
> = props => {
  const { resource, goToSparqlView, goToElasticSearchView } = props;
  return (
    <Card className="resource-actions">
      {makeActions(resource, {
        goToSparqlView,
        goToElasticSearchView,
      })}
    </Card>
  );
};

export default ResourceActions;

import * as React from 'react';
import { Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { Spin, Card } from 'antd';

import AnimatedList from '../Animations/AnimatedList';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import ResourceListItem from './ResourceItem';
import { labelOf } from '../../utils';
import { LinksState } from '../../store/reducers/links';

import './links-container.less';

export interface LinksListProps extends LinksContainerProps {
  incomingOrOutgoing: 'incoming' | 'outgoing';
}

const LinksList: React.FunctionComponent<LinksListProps> = props => {
  const {
    links,
    goToResource,
    fetchLinks,
    incomingOrOutgoing,
    resource,
    linksListPageSize,
  } = props;
  const linkState = links && links[incomingOrOutgoing];
  const from = (linkState && linkState.data && linkState.data.index) || 0;
  const total = (linkState && linkState.data && linkState.data.total) || 0;
  const paginationSettings = { from, total, size: linksListPageSize };
  React.useEffect(() => {
    if (!linkState) {
      fetchLinks(resource, incomingOrOutgoing, paginationSettings);
    }
  }, [linkState, resource]);

  if (!linkState) {
    return <Spin />;
  }

  return (
    <AnimatedList
      header={<h3 className="title">{incomingOrOutgoing} Links</h3>}
      loading={linkState.isFetching}
      makeKey={(item: ResourceLink, index: number) =>
        `${
          item.isExternal ? (item.link as string) : (item.link as Resource).id
        }-${index}`
      }
      results={(linkState.data && linkState.data.results) || []}
      total={(linkState.data && linkState.data.total) || 0}
      paginationSettings={{ from, total, pageSize: linksListPageSize }}
      onPaginationChange={(page: number, pageSize?: number) => {
        // NOTE: page begins from 1, not 0.
        // from is the total number of resources beggining from 0, not the page number!
        const size = pageSize || linksListPageSize;
        fetchLinks(resource, incomingOrOutgoing, {
          size,
          from: page * size - size,
        });
      }}
      itemComponent={(resourceLink: ResourceLink, index: number) => (
        <div>
          <div>{labelOf(resourceLink.predicate)}</div>
          {resourceLink.isExternal ? (
            <a href={resourceLink.link as string} target="_blank">
              {resourceLink.link as string}
            </a>
          ) : (
            <ResourceListItem
              index={index}
              resource={resourceLink.link as Resource}
              onClick={() => goToResource(resourceLink.link as Resource)}
            />
          )}
        </div>
      )}
    />
  );
};

export interface LinksContainerProps {
  goToResource: (resource: Resource) => void;
  fetchLinks: (
    resource: Resource,
    incomingOrOutgoing: 'incoming' | 'outgoing',
    paginationSettings: PaginationSettings
  ) => void;
  resource: Resource;
  linksListPageSize: number;
  links: LinksState | null;
}

const LinksContainer: React.FunctionComponent<LinksContainerProps> = props => {
  return (
    <div className="links-container">
      <Card>
        <LinksList incomingOrOutgoing="incoming" {...props} />
      </Card>

      <Card>
        <LinksList incomingOrOutgoing="outgoing" {...props} />
      </Card>
    </div>
  );
};

export default LinksContainer;

import * as React from 'react';
import { Resource, PaginatedList, PaginationSettings } from '@bbp/nexus-sdk';
import { Spin, Card } from 'antd';

import AnimatedList from '../Animations/AnimatedList';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import ResourceListItem from './ResourceItem';
import { titleOf } from '../../utils';
import { FetchableState } from '../../store/reducers/utils';
import { LinksState } from '../../store/reducers/links';

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
  } = props;
  const linkState = links && links[incomingOrOutgoing];
  React.useEffect(() => {
    if (!linkState) {
      fetchLinks(resource, incomingOrOutgoing, { from: 0, size: 20 });
    }
  }, [linkState]);

  if (!linkState) {
    return <Spin />;
  }

  return (
    <AnimatedList
      header={<>{incomingOrOutgoing}</>}
      loading={linkState.isFetching}
      makeKey={(item: ResourceLink) =>
        item.isExternal ? (item.link as string) : (item.link as Resource).id
      }
      results={(linkState.data && linkState.data.results) || []}
      total={(linkState.data && linkState.data.total) || 0}
      itemComponent={(resourceLink: ResourceLink, index: number) => (
        <div>
          <div>{titleOf(resourceLink.predicate)}</div>
          {resourceLink.isExternal ? (
            <a href={resourceLink.link as string} target="_blank">
              external link
              {/* {resourceLink.link as string} */}
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

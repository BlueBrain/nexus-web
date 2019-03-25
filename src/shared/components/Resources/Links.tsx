import * as React from 'react';
import { Resource, PaginationSettings, NexusFile } from '@bbp/nexus-sdk';
import { Spin, Card, Icon } from 'antd';

import AnimatedList from '../Animations/AnimatedList';
import { ResourceLink } from '@bbp/nexus-sdk/lib/Resource/types';
import ResourceListItem from './ResourceItem';
import { labelOf } from '../../utils';
import { LinksState } from '../../store/reducers/links';

import './links-container.less';
import { LinkDirection } from '../../store/actions/nexus/links';

export interface LinksListProps extends LinksContainerProps {
  linkDirection: LinkDirection;
}

const LinksList: React.FunctionComponent<LinksListProps> = props => {
  const {
    links,
    goToResource,
    fetchLinks,
    linkDirection,
    resource,
    linksListPageSize,
    getFilePreview,
  } = props;
  const linkState = links && links[linkDirection];
  const from = (linkState && linkState.data && linkState.data.index) || 0;
  const total = (linkState && linkState.data && linkState.data.total) || 0;
  const paginationSettings = { from, total, size: linksListPageSize };

  React.useEffect(() => {
    fetchLinks(resource, linkDirection, paginationSettings);
  }, [resource]);

  return (
    <AnimatedList
      header={
        <h3 className="title">
          {linkDirection === LinkDirection.INCOMING ? (
            <Icon type="download" />
          ) : (
            <Icon type="upload" />
          )}{' '}
          {linkDirection} Links
        </h3>
      }
      loading={linkState ? linkState.isFetching : true}
      makeKey={(item: ResourceLink, index: number) =>
        `${resource.id}-${
          item.isExternal ? (item.link as string) : (item.link as Resource).id
        }-${index}-${linkDirection}`
      }
      results={(linkState && linkState.data && linkState.data.results) || []}
      total={(linkState && linkState.data && linkState.data.total) || 0}
      paginationSettings={{ from, total, pageSize: linksListPageSize }}
      onPaginationChange={(page: number, pageSize?: number) => {
        // NOTE: page begins from 1, not 0.
        // from is the total number of resources beggining from 0, not the page number!
        const size = pageSize || linksListPageSize;
        fetchLinks(resource, linkDirection, {
          size,
          from: page * size - size,
        });
      }}
      itemComponent={(resourceLink: ResourceLink, index: number) => {
        const predicate = labelOf(resourceLink.predicate);
        return (
          <>
            {resourceLink.isExternal ? (
              <a
                className="clickable-container resource-item"
                href={resourceLink.link as string}
                target="_blank"
              >
                <div className="predicate">{predicate}</div>
                <div className="label">
                  <div className="name">
                    {resourceLink.link as string} <Icon type="export" />
                  </div>
                </div>
              </a>
            ) : (
              <ResourceListItem
                getFilePreview={getFilePreview}
                predicate={predicate}
                index={index}
                resource={resourceLink.link as Resource}
                onClick={() => goToResource(resourceLink.link as Resource)}
              />
            )}
          </>
        );
      }}
    />
  );
};

export interface LinksContainerProps {
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  fetchLinks: (
    resource: Resource,
    linkDirection: LinkDirection,
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
        <LinksList linkDirection={LinkDirection.INCOMING} {...props} />
      </Card>

      <Card>
        <LinksList linkDirection={LinkDirection.OUTGOING} {...props} />
      </Card>
    </div>
  );
};

export default LinksContainer;

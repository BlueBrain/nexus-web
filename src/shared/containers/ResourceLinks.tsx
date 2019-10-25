import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { ResourceLink } from '@bbp/nexus-sdk';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import ResourceLinks from '../components/ResourceLinks';

const PAGE_SIZE = 10;

const ResourceLinksContainer: React.FunctionComponent<{
  self: string;
  rev: number;
  direction: 'incoming' | 'outgoing';
  onClick?: (link: ResourceLink) => void;
}> = ({ self, rev, direction, onClick }) => {
  const nexus = useNexusContext();
  const [{ busy, error, links, total, next }, setLinks] = React.useState<{
    busy: boolean;
    error: Error | null;
    links: ResourceLink[];
    next: string | null;
    total: number;
  }>({
    next: null,
    busy: false,
    error: null,
    links: [],
    total: 0,
  });
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(self);

  const handleLoadMore = async () => {
    if (busy || !next) {
      return;
    }
    try {
      setLinks({
        next,
        links,
        total,
        busy: true,
        error: null,
      });
      const response = await nexus.httpGet({
        path: next,
      });
      setLinks({
        next: response._next || null,
        links: [...links, ...response._results],
        total: response._total,
        busy: false,
        error: null,
      });
    } catch (error) {
      setLinks({
        next,
        error,
        links,
        total,
        busy: false,
      });
    }
  };

  // Reset everything when self prop changes
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return;
      }
      try {
        setLinks({
          next,
          links,
          total,
          busy: true,
          error: null,
        });
        const response = await nexus.Resource.links(
          orgLabel,
          projectLabel,
          resourceId,
          direction,
          {
            rev,
            size: PAGE_SIZE,
            from: 0,
          }
        );
        setLinks({
          next: response._next || null,
          links: response._results,
          total: response._total,
          busy: false,
          error: null,
        });
      } catch (error) {
        setLinks({
          next,
          error,
          links,
          total,
          busy: false,
        });
      }
    },
    [self]
  );

  return (
    <ResourceLinks
      error={error}
      links={links}
      total={total}
      busy={busy}
      onLoadMore={handleLoadMore}
      onClick={onClick}
    />
  );
};

export default ResourceLinksContainer;

import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
// TODO: update when SDK has ResourceLink
// @ts-ignore
import { ResourceLink } from '@bbp/nexus-sdk';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import ResourceLinks from '../components/ResourceLinks';

const ResourceLinksContainer: React.FunctionComponent<{
  self: string;
  rev: number;
  direction: 'incoming' | 'outgoing';
  onClick?: (link: ResourceLink) => void;
}> = ({ self, rev, direction, onClick }) => {
  const nexus = useNexusContext();
  const [searchValue, setSearchValue] = React.useState('');
  const [{ from, size }, setPagination] = React.useState({
    from: 0,
    size: 20,
  });
  const [{ busy, error, links, total }, setLinks] = React.useState<{
    busy: boolean;
    error: Error | null;
    links: ResourceLink[];
    total: number;
  }>({
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

  const handleLoadMore = (from: number) => {
    setPagination({
      size,
      from,
    });
  };

  useAsyncEffect(async () => {
    try {
      setLinks({
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
          from,
          size,
          q: searchValue,
        }
      );
      setLinks({
        links: [...links, ...response._results],
        total: response._total,
        busy: true,
        error: null,
      });
    } catch (error) {
      setLinks({
        error,
        links,
        total,
        busy: false,
      });
    }
  }, [self, from, size]);
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

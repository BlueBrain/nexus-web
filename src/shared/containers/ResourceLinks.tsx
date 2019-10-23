import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink } from '@bbp/nexus-sdk';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import ResourceLinks from '../components/ResourceLinks';

const ResourceLinksContainer: React.FunctionComponent<{
  self: string;
  rev: number;
  direction: 'incoming' | 'outgoing';
  link?: (rev: number) => React.ReactNode;
}> = ({ self, rev, direction, link }) => {
  const nexus = useNexusContext();
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
          from: 0,
          size: 4,
        }
      );
      setLinks({
        links: response._results,
        total: response.total,
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
  }, [self]);
  return (
    <ResourceLinks error={error} links={links} total={total} busy={busy} />
  );
};

export default ResourceLinksContainer;

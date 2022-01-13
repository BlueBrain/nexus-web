import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import ResourceLinks from '../components/ResourceLinks';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { ResourceLinkAugmented } from '../components/ResourceLinks/ResourceLinkItem';

const PAGE_SIZE = 10;

const ResourceLinksContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  direction: 'incoming' | 'outgoing';
  onClick?: (link: ResourceLinkAugmented) => void;
}> = ({ resourceId, orgLabel, projectLabel, rev, direction, onClick }) => {
  const nexus = useNexusContext();
  const [{ busy, error, links, total, next }, setLinks] = React.useState<{
    busy: boolean;
    error: Error | null;
    links: ResourceLinkAugmented[];
    next: string | null;
    total: number;
  }>({
    next: null,
    busy: false,
    error: null,
    links: [],
    total: 0,
  });
  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  const splits = apiEndpoint.split('/');
  const apiBase = splits.slice(0, splits.length - 1).join('/');

  const isLinkRevisionSpecific = (link: Resource) =>
    !(link as Resource)._self && link['@id'].startsWith(apiBase);

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
      // do we also need to get augmented links here?
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
          encodeURIComponent(resourceId),
          direction,
          {
            rev,
            size: PAGE_SIZE,
            from: 0,
          }
        );
        const augmentedLinks = (
          await Promise.all(
            response._results.map(link => {
              if (isLinkRevisionSpecific(link as Resource)) {
                return nexus.httpGet({
                  path: link['@id'],
                });
              }
              return new Promise(resolve => resolve(link));
            })
          )
        ).map((link, ix) => ({
          // replace @id with @id from resource
          // add isRevisionSpecific and originalLinkID params
          ...(link as Resource),
          paths: response._results[ix]['paths'],
          isRevisionSpecific: isLinkRevisionSpecific(
            response._results[ix] as Resource
          ),
          originalLinkID: response._results[ix]['@id'],
        }));

        setLinks({
          next: response._next || null,
          links: augmentedLinks,
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
    [resourceId, projectLabel, orgLabel]
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

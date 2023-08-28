import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink } from '@bbp/nexus-sdk/es';
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
    !(link as Resource)._self &&
    link['@id'].startsWith(apiBase) &&
    link['@id'].includes('rev=');

  /**
   * Delta doesn't fully support links to specific revisions of resources.
   * The @id property can be specified with a revision parameter @id?rev=n but
   * calls to the .../outgoing endpoint don't populate such links with the
   * resource metadata or correctly populate the paths property.
   * In Fusion, we therefore have to identify these types of links and make
   * another API call to get the metadata and missing paths property. To
   * support handling these links correctly we add 2 additional properties
   * which includes the original id specified for the link and if it is a
   * link to a specific revision.
   *
   *
   * @param resourceLinks Resource links as returned from Delta
   * @returns array of ResourceLinkAugmented which changes the original @id value
   * of the links and flils in the paths property. It also adds isRevisionSpecific
   * and originalLinkID for determining how to navigate the link
   */
  const augmentLinks = async (resourceLinks: ResourceLink[]) => {
    return (
      await Promise.all(
        resourceLinks.map(link => {
          if (isLinkRevisionSpecific(link as Resource)) {
            return nexus.httpGet({
              path: link['@id'],
            });
          }
          return new Promise(resolve => resolve(link));
        })
      )
    ).map((link, ix) => ({
      ...(link as Resource), // resource metadata and replace link @id (which may include ?rev=n)
      paths: resourceLinks[ix]['paths'], // paths is not correctly populated for revisioned links
      isRevisionSpecific: isLinkRevisionSpecific(resourceLinks[ix] as Resource),
      originalLinkID: resourceLinks[ix]['@id'],
    }));
  };

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

      const augmentedLinks = await augmentLinks(response._results);
      setLinks({
        next: response._next || null,
        links: [...links, ...augmentedLinks],
        total: response._total,
        busy: false,
        error: null,
      });
    } catch (error) {
      setLinks({
        next,
        links,
        total,
        error: error as Error,
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
        const augmentedLinks = await augmentLinks(response._results);

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
          links,
          total,
          error: error as Error,
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

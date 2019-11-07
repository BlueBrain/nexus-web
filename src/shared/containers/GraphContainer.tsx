import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink, Resource } from '@bbp/nexus-sdk';
import {
  getResourceLabelsAndIdsFromSelf,
  getResourceLabel,
  labelOf,
} from '../utils';

import Graph from '../components/Graph/Graph';

const GraphContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
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
  } = getResourceLabelsAndIdsFromSelf(resource._self);

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
          'outgoing'
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

  const elements: cytoscape.ElementDefinition[] = [
    {
      data: {
        id: resource['@id'],
        label: getResourceLabel(resource),
      },
    },
    // Link Nodes
    ...links.map(link => ({
      data: {
        id: link['@id'],
        label: labelOf(link['@id']),
      },
    })),
    // Link Edges
    ...links.map(link => ({
      data: {
        id: `edge-${resource['@id']}-${link['@id']}`,
        source: resource['@id'],
        target: link['@id'],
        label: Array.isArray(link.paths)
          ? link.paths.map(pathName => labelOf(pathName)).join(',')
          : labelOf(link.paths),
      },
    })),
  ];

  console.log({ elements });

  const handleNodeClick = () => {
    console.log('click!');
  };

  return <Graph elements={elements} onNodeClick={handleNodeClick} />;
};

export default GraphContainer;

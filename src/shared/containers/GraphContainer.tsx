import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useNexusContext } from '@bbp/react-nexus';
import { ResourceLink } from '@bbp/nexus-sdk';
import { getResourceLabelsAndIdsFromSelf } from '../utils';

import Graph from '../components/Graph/Graph';

interface GraphContainerProps {
  self: string;
}

const GraphContainer: React.FunctionComponent<GraphContainerProps> = ({ self }) => {
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
          'outgoing',
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
    <div>
      <h1>* Under construction *</h1>
      <p>Resource: {resourceId}</p>
      <p>Outgoing links: TOTAL {links && links.length}</p>
      {links && links.map(link => (
        <p>{link['@id']}</p>
      ))}
      <Graph />
    </div>
  )
}

export default GraphContainer;
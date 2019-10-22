import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { useAsyncEffect } from 'use-async-effect';
import { getResourceLabelsAndIdsFromSelf } from '../utils';

const HistoryContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const [revisions, setRevisions] = React.useState<Resource[]>([]);
  const nexus = useNexusContext();
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(resource._self);

  useAsyncEffect(async () => {
    const {
      orgLabel,
      projectLabel,
      resourceId,
    } = getResourceLabelsAndIdsFromSelf(resource._self);
    // This creates an array like [0,1,2,3]
    // so if you have 4 revisions
    // it will be [0,1,2,3]
    const promises = [...Array(resource._rev).keys()]
      // now map them to resource revisions
      .map((index: number) => {
        return nexus.Resource.get(orgLabel, projectLabel, resourceId, {
          rev: index + 1,
        });
      });
    const revisions = await Promise.all(promises);
    setRevisions(revisions);
  }, [orgLabel, projectLabel, resourceId]);

  return null;
};

export default HistoryContainer;

import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { diff, detailedDiff } from 'deep-object-diff';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import { blacklistKeys, getUsername } from '../utils';
import HistoryComponent from '../components/History';
import { isEmpty } from 'lodash';

const HistoryContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  latestRev: number;
  link?: (rev: number) => React.ReactNode;
}> = ({ resourceId, orgLabel, projectLabel, latestRev, link }) => {
  const [revisions, setRevisions] = React.useState<
    {
      changes: object;
      hasChanges: boolean;
      userName: string;
      updatedAt: string;
      createdAt: string;
    }[]
  >([]);
  const nexus = useNexusContext();

  useAsyncEffect(async () => {
    // This creates an array like [0,1,2,3]
    // so if you have 4 revisions
    // it will be [0,1,2,3]
    const promises = [...Array(latestRev).keys()]
      // now map them to resource revisions
      .map((index: number) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(resourceId),
          {
            rev: index + 1,
          }
        );
      });

    const metadataKeys = ['_rev', '_updatedAt', '_updatedBy'];
    const revisions = await Promise.all(promises);
    setRevisions(
      (revisions as Resource[]).map((revision: Resource, index: number) => {
        const previous = blacklistKeys(
          revisions[index - 1] || {},
          metadataKeys
        );
        const current = blacklistKeys(revision, metadataKeys);
        const changes = Object.entries(detailedDiff(previous, current))
          .filter(property => !isEmpty(property[1]))
          .reduce(
            (acc, [key, value]) => Object.assign(acc, { [key]: value }),
            {}
          );
        const hasChanges = Object.entries(changes).some(
          ([, value]) => !isEmpty(value)
        );

        return {
          changes,
          hasChanges,
          userName: getUsername(revision._updatedBy),
          updatedAt: revision._updatedAt,
          createdAt: revision._createdAt,
        };
      })
    );
  }, [orgLabel, projectLabel, resourceId, latestRev]);

  return <HistoryComponent revisions={revisions} link={link} />;
};

export default HistoryContainer;

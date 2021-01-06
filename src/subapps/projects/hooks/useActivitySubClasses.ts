import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import fusionConfig from '../config';
import { isSubClass } from '../utils';

export const useActivitySubClasses = () => {
  const nexus = useNexusContext();
  const [subClassesOfActivity, setSubClassesOfActivity] = React.useState<
    string[]
  >([]);

  const {
    datamodelsOrg,
    datamodelsProject,
    datamodelsActivityId,
  } = fusionConfig;

  const fetchSubClasses = () => {
    const fetchSubClassesRecursively = (id: string, acc: string[]) => {
      nexus.Resource.links(
        datamodelsOrg,
        datamodelsProject,
        encodeURIComponent(id),
        'incoming'
      )
        .then((response: any) => {
          if (response._total > 0) {
            const links = response._results.filter((link: any) =>
              isSubClass(link)
            );

            const linksIds = links.map((link: any) => link['@id']);

            Promise.all(
              links.map((link: any) => {
                fetchSubClassesRecursively(link['@id'], [...linksIds, ...acc]);
              })
            );
          } else {
            setSubClassesOfActivity([...acc]);
          }
        })
        .catch(error => console.log('error', error));
    };

    fetchSubClassesRecursively(datamodelsActivityId, []);
  };

  return {
    fetchSubClasses,
    subClasses: subClassesOfActivity,
  };
};

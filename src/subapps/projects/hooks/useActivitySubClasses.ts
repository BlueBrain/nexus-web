import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import { isSubClass } from '../utils';

export type ActivityResourceType = Resource<{
  [key: string]: any;
}>;

export const useActivitySubClasses = () => {
  const nexus = useNexusContext();
  const [subClassesIds, setsubClassesIds] = React.useState<string[]>([]);
  const [subClasses, setSubClasses] = React.useState<
    {
      label: string;
      ['@id']: string;
    }[]
  >([]);

  const {
    datamodelsOrg,
    datamodelsProject,
    datamodelsActivityId,
  } = fusionConfig;

  React.useEffect(() => {
    if (subClassesIds && subClassesIds.length > 0) {
      Promise.all(
        subClassesIds.map((id: string) => {
          return nexus.Resource.get(
            datamodelsOrg,
            datamodelsProject,
            encodeURIComponent(id)
          );
        })
      ).then(data => {
        const subClassesList = data.map(subClass => ({
          // @ts-ignore
          label: subClass.label,
          ['@id']: subClass['@id'],
        }));

        setSubClasses(subClassesList);
      });
    }
  }, [subClassesIds.length]);

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
            setsubClassesIds([...acc]);
          }
        })
        .catch(error => console.log('error', error));
    };

    fetchSubClassesRecursively(datamodelsActivityId, []);
  };

  return {
    fetchSubClasses,
    subClasses,
  };
};

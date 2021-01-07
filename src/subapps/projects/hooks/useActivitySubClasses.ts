import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink, PaginatedList } from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import { isSubClass } from '../utils';
import { displayError } from '../components/Notifications';

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
          ) as Promise<
            Resource<{
              label: string;
            }>
          >;
        })
      )
        .then(data => {
          const subClassesList = data.map(subClass => {
            return {
              label: subClass.label,
              ['@id']: subClass['@id'],
            };
          });

          setSubClasses(subClassesList);
        })
        .catch(error => displayError(error, 'Failed to load activities'));
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
        .then((response: PaginatedList<ResourceLink>) => {
          if (response._total > 0) {
            const links = response._results.filter((link: ResourceLink) =>
              isSubClass(link)
            );

            const linksIds = links.map((link: ResourceLink) => link['@id']);

            Promise.all(
              links.map((link: ResourceLink) => {
                fetchSubClassesRecursively(link['@id'], [...linksIds, ...acc]);
              })
            );
          } else {
            setsubClassesIds([...acc]);
          }
        })
        .catch(error => displayError(error, 'Failed to load activities'));
    };

    fetchSubClassesRecursively(datamodelsActivityId, []);
  };

  return {
    fetchSubClasses,
    subClasses,
  };
};

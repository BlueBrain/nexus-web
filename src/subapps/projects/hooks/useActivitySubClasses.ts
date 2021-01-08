import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, ResourceLink, PaginatedList } from '@bbp/nexus-sdk';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store/reducers';

import fusionConfig from '../config';
import { isSubClass } from '../utils';

export const useActivitySubClasses = () => {
  const nexus = useNexusContext();
  const dataModelsLocation = useSelector(
    (state: RootState) => state.config.dataModelsLocation
  );
  const [subClassesIds, setsubClassesIds] = React.useState<string[]>([]);
  const [subClasses, setSubClasses] = React.useState<{
    loading: boolean;
    data: {
      label: string;
      ['@id']: string;
    }[];
    error: Error | null;
  }>({
    loading: false,
    error: null,
    data: [],
  });

  const [datamodelsOrg, datamodelsProject] = dataModelsLocation.split('/');

  const { datamodelsActivityId } = fusionConfig;

  React.useEffect(() => {
    setSubClasses({
      loading: true,
      error: null,
      data: [],
    });
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
          const subClassesList = data.map(subClass => ({
            label: subClass.label,
            ['@id']: subClass['@id'],
          }));
          setSubClasses({
            loading: false,
            error: null,
            data: subClassesList,
          });
        })
        .catch(error =>
          setSubClasses({
            loading: false,
            error,
            data: [],
          })
        );
    }
  }, [subClassesIds.length]);

  const fetchSubClasses = () => {
    setSubClasses({
      loading: false,
      error: null,
      data: [],
    });

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
        .catch(error =>
          setSubClasses({
            loading: false,
            error,
            data: [],
          })
        );
    };

    fetchSubClassesRecursively(datamodelsActivityId, []);
  };

  return {
    fetchSubClasses,
    subClasses: subClasses.data,
    error: subClasses.error,
    loading: subClasses.loading,
  };
};

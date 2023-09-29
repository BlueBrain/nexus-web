import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient, Resource } from '@bbp/nexus-sdk/es';
import { Empty, Skeleton } from 'antd';
import { match, when } from 'ts-pattern';

import useAsyncCall from '../hooks/useAsynCall';
import useAsyncCallback from '../hooks/useAsyncCallback';
import MarkdownEditorComponent from '../components/MarkdownEditor';
import MarkdownViewerContainer from './MarkdownViewer';

const fetchResource = (nexus: NexusClient) => async (
  orgLabel: string,
  projectLabel: string,
  resourceId: string,
  rev: number
) =>
  await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(resourceId),
    {
      rev,
    }
  );

const saveDescription = (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  resourceId: string,
  rev: number,
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void
) => async (resource: Resource, value: string) => {
  const newResource = await nexus.Resource.update(
    orgLabel,
    projectLabel,
    encodeURIComponent(resourceId),
    rev,
    {
      ...resource,
      description: value,
    }
  );
  goToResource(orgLabel, projectLabel, encodeURIComponent(resourceId), {
    revision: newResource._rev,
    tab: '#mde',
  });
};

export const saveImage = (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
) => {
  return async function*(data: ArrayBuffer) {
    const blob = new Blob([data]);
    const formData = new FormData();
    formData.append('file', blob);

    const file = await nexus.File.create(orgLabel, projectLabel, {
      file: formData,
    });

    // yield the url to image location
    yield file._self;

    // returns true meaning that the save was successful
    return true;
  };
};

const MarkdownEditorContainer: React.FC<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  readOnly: boolean;
  goToResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    opt: {
      revision?: number;
      tab?: string;
      expanded?: boolean;
    }
  ) => void;
}> = ({ resourceId, orgLabel, projectLabel, rev, readOnly, goToResource }) => {
  const nexus = useNexusContext();

  const asyncData = useAsyncCall<Resource, Error & { reason: string }>(
    fetchResource(nexus)(orgLabel, projectLabel, resourceId, rev) as Promise<
      Resource
    >,
    [resourceId, orgLabel, projectLabel, rev]
  );

  const [savingData, setSavingData] = useAsyncCallback<
    (resource: Resource, value: string) => void,
    void,
    Error & { reason: string }
  >(
    saveDescription(
      nexus,
      orgLabel,
      projectLabel,
      resourceId,
      rev,
      goToResource
    ),
    [asyncData.data]
  );

  const handleSaveImage = saveImage(nexus, orgLabel, projectLabel);

  return match({
    loading: asyncData.loading || savingData.loading,
    data: asyncData.data,
    error: asyncData.error || savingData.error,
  })
    .with({ loading: true }, () => <Skeleton active />)
    .with({ error: when(error => !!error) }, ({ error }) =>
      error ? (
        <Empty
          description={`There was an error loading the resource: \n ${error?.message ||
            error?.reason ||
            'unknown reason'}`}
        />
      ) : (
        <></>
      )
    )
    .with({ data: when(data => !!data) }, ({ data: resource }) =>
      resource ? (
        <MarkdownEditorComponent
          resource={resource}
          readOnly={readOnly}
          loading={savingData.loading || asyncData.loading}
          onSave={value => {
            asyncData.data && setSavingData(asyncData.data, value);
          }}
          markdownViewer={MarkdownViewerContainer}
          onSaveImage={handleSaveImage}
        />
      ) : (
        <></>
      )
    )
    .otherwise(() => <Empty description="An unkown error occured" />);
};

export default MarkdownEditorContainer;

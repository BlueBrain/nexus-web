import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient, NexusFile, Resource } from '@bbp/nexus-sdk/es';

import { convertMarkdownHandlebarStringWithData } from '../utils/markdownTemplate';
import useAsyncCall from '../hooks/useAsynCall';
import { parseURL } from '../utils/nexusParse';
import { getResourceLabel } from '../utils';
import { match, when } from 'ts-pattern';
import { Skeleton } from 'antd';

export const requestNexusImage = async (
  nexus: NexusClient,
  image: HTMLImageElement
) => {
  let imageSrcData;
  try {
    imageSrcData = parseURL(image.src);
  } catch (error) {
    // not nexus URL, ignore
  }
  if (!imageSrcData) {
    return;
  }
  image.alt = 'Image Loading';
  const { org, project, id } = imageSrcData;
  const imageMetadata = await nexus.File.get(org, project, id);
  const rawImageData = await nexus.File.get(org, project, id, { as: 'blob' });
  const blob = new Blob([rawImageData as string], {
    type: (imageMetadata as NexusFile)._mediaType,
  });
  image.alt = getResourceLabel(imageMetadata as Resource);
  image.src = URL.createObjectURL(blob);
};

const MarkdownViewerContainer: React.FC<{
  template: string;
  data: object;
}> = ({ template, data }) => {
  const nexus = useNexusContext();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const markdownData = useAsyncCall<string, Error>(
    Promise.resolve(convertMarkdownHandlebarStringWithData(template, data)),
    [template, data]
  );
  const processImages = async () => {
    const div = wrapperRef.current;
    if (div) {
      const images = Array.from(div.querySelectorAll('img'));
      await Promise.all(images.map(image => requestNexusImage(nexus, image)));
    }
  };
  useAsyncCall<void, Error>(processImages(), [wrapperRef, template, data]);

  return match(markdownData)
    .with({ loading: true, error: null }, () => (
      <div>
        <Skeleton active />
      </div>
    ))
    .with(
      {
        error: when(error => !error),
        data: when(data => !!data),
      },
      () => (
        <div
          ref={wrapperRef}
          dangerouslySetInnerHTML={{ __html: markdownData.data || '' }}
        ></div>
      )
    )
    .with(
      {
        error: when(error => !error),
        data: '',
      },
      () => (
        <div>
          <p>No description provided</p>
          <div ref={wrapperRef} dangerouslySetInnerHTML={{ __html: '' }} />
        </div>
      )
    )
    .run();
};

export default MarkdownViewerContainer;

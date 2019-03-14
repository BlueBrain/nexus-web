import * as React from 'react';
import { Popover, Avatar, notification } from 'antd';
import './Resources.less';
import { Resource, NexusFile } from '@bbp/nexus-sdk';

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourcePreviewProps {
  resource: Resource;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
}

export function hasDisplayableImage(resource: Resource): boolean {
  return (
    resource.type &&
    resource.type.includes('File') &&
    (resource.data as any)['_mediaType'] &&
    (resource.data as any)['_mediaType'].includes('image') &&
    // Don't download preview if filesize is > than 1MB
    (resource.data as any)['_bytes'] <= 1e6
  );
}

const ResourcePreview: React.FunctionComponent<
  ResourcePreviewProps
> = props => {
  const { resource, getFilePreview } = props;
  const [file, setFile] = React.useState<NexusFile | null>(null);

  if (!file) {
    // TODO: Refactor after ES Lists are fetched by Type
    getFilePreview(resource.self)
      .then((nexusFile: NexusFile) => {
        setFile(nexusFile);
      })
      .catch((error: Error) => {
        notification.error({
          message: 'A file loading error occured',
          description: error.message,
          duration: 0,
        });
        // tslint:disable-next-line:no-console
        console.error(error);
      });
  }

  return (
    <Popover content={'hello'} mouseEnterDelay={MOUSE_ENTER_DELAY}>
      {file ? (
        <Avatar
          shape="square"
          src={`data:${file.mediaType};base64,${file.rawFile as string}`}
        />
      ) : (
        <Avatar shape="square" icon="picture" />
      )}
    </Popover>
  );
};

export default ResourcePreview;

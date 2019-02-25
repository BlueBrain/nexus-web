import * as React from 'react';
import { Popover, Avatar } from 'antd';
import './Resources.less';
import { Resource, NexusFile } from '@bbp/nexus-sdk';

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourcePreviewProps {
  resource: Resource;
}

const ResourcePreview: React.FunctionComponent<
  ResourcePreviewProps
> = props => {
  const { resource } = props;
  const [file, setFile] = React.useState<NexusFile | null>(null);

  if (!file) {
    // TODO: Refactor after ES Lists are fetched by Type
    NexusFile.getSelf(
      resource.self,
      resource.orgLabel,
      resource.projectLabel,
      true
    )
      .then((nexusFile: NexusFile) => {
        setFile(nexusFile);
      })
      .catch((error: Error) => {
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

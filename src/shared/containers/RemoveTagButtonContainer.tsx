import * as React from 'react';
import { Button, Dropdown, Menu, Popconfirm, Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import useNotification from '../hooks/useNotification';

const RemoveTagButton: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
  revision: number;
  refreshResource: () => void;
}> = ({ orgLabel, projectLabel, resourceId, revision, refreshResource }) => {
  const nexus = useNexusContext();
  const [tags, setTags] = React.useState<
    {
      rev: number;
      tag: string;
    }[]
  >();
  const [hasTags, setHasTags] = React.useState(false);
  const [confirm, setConfirm] = React.useState({
    visible: false,
    tagName: '',
    busy: false,
  });

  const notification = useNotification();

  const removeTag = async (tagName: string) => {
    try {
      setConfirm({ tagName: '', visible: false, busy: true });

      await nexus.Resource.removeTag(
        orgLabel,
        projectLabel,
        resourceId,
        tagName,
        revision
      );
      refreshResource();
      notification.success({
        message: `Tag successfully removed`,
        description: 'Tag removed',
      });
    } catch (e) {
      notification.error({
        message: `Error removing tag`,
        description:
          'An error occurred whilst attempting to remove the tag from the tag from the resource. Please try again.',
      });
    } finally {
      setConfirm({ tagName: '', visible: false, busy: false });
    }
  };

  React.useEffect(() => {
    const getTags = async () => {
      const result = await nexus.Resource.tags(
        orgLabel,
        projectLabel,
        resourceId
      );
      setTags(result.tags);
    };
    getTags();
  }, [orgLabel, projectLabel, resourceId, revision]);

  React.useEffect(() => {
    setHasTags(!!(tags && tags.length > 0));
  }, [tags]);

  const menu = (
    <Menu
      onClick={e => {
        setConfirm({ visible: true, tagName: e.key.toString(), busy: false });
      }}
    >
      {tags?.map(t => (
        <Menu.Item key={t.tag}>
          {t.tag} (<em>revision {t.rev} </em>)
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="action">
      <Spin spinning={confirm.busy}>
        <Popconfirm
          title={'Are you sure you want to remove the tag from the resource?'}
          onConfirm={e => removeTag(confirm.tagName)}
          okText="Yes"
          cancelText="No"
          onCancel={() =>
            setConfirm({ visible: false, tagName: '', busy: false })
          }
          visible={confirm.visible}
        >
          <Dropdown disabled={!hasTags} overlay={menu}>
            <Button icon={<DeleteOutlined />}>
              Remove Tag <DownOutlined />
            </Button>
          </Dropdown>
        </Popconfirm>
      </Spin>
    </div>
  );
};

export default RemoveTagButton;

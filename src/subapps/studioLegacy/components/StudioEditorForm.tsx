import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Button, Tabs, Switch } from 'antd';
import { SaveImageHandler } from 'react-mde';
import {
  ArrowsAltOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';

import { MarkdownEditorFormItemComponent } from '../../../shared/components/MarkdownEditor';
import TabList from '../../../shared/components/Tabs/TabList';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import usePlugins from '../../../shared/hooks/usePlugins';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
  plugins?: {
    key: string;
    name: string;
    expanded: boolean;
  }[];
}>;

const StudioEditorForm: React.FC<{
  saveStudio?(label: string, description?: string): void;
  studio?: StudioResource | null;
  onSaveImage: SaveImageHandler;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({ saveStudio, studio, onSaveImage, markdownViewer }) => {
  const { data: pluginManifest } = usePlugins();
  const [plugins, setPlugins] = React.useState<
    {
      key: string;
      name: string;
      visible: boolean | undefined;
      expanded: boolean | undefined;
    }[]
  >();

  React.useEffect(() => {
    const configuredPlugins =
      studio && studio.plugins
        ? studio.plugins.map(p => ({ ...p, visible: true }))
        : [];
    const otherAvailablePlugins = Object.keys(pluginManifest || {})
      .map(key => {
        return {
          key,
          name: pluginManifest ? pluginManifest[key].name : '',
          visible: false,
          expanded: false,
        };
      })
      .filter(p => !configuredPlugins.find(c => c.key === p.key));
    setPlugins([...configuredPlugins, ...otherAvailablePlugins]);
  }, [pluginManifest]);

  const handleSubmit = (values: { label: string; description: string }) => {
    const { label, description } = values;
    saveStudio && saveStudio(label, description);
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };

  const { label, description } = studio || {
    label: '',
    description: '',
  };

  return (
    <>
      <Tabs>
        <Tabs.TabPane tab="Plugins" key="plugins">
          <p>
            Customise which plugins will appear for resources accessed via this
            Studio.
          </p>
          <DragDropContext
            onDragEnd={result => {
              const { destination, source } = result;
              if (!destination || !plugins) {
                return;
              }
              const pluginsCopy = [...plugins];
              const pluginToMove = pluginsCopy.splice(source.index, 1);

              if (destination.index === plugins.length - 1) {
                pluginsCopy.push(pluginToMove[0]);
              } else if (destination.index < source.index) {
                pluginsCopy.splice(destination.index, 0, pluginToMove[0]);
              } else {
                pluginsCopy.splice(destination.index + 1, 0, pluginToMove[0]);
              }

              setPlugins(pluginsCopy);
            }}
          >
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  className="column-visibility-container"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Form>
                    {plugins
                      ?.filter(p => p.visible)
                      .map((el, ix) => (
                        <Draggable key={el.key} draggableId={el.key} index={ix}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Form.Item
                                key={el.key}
                                style={{ marginBottom: 0 }}
                              >
                                <MoreOutlined />
                                <label>
                                  <Switch
                                    title="Hide plugin"
                                    size="small"
                                    checked={el.visible}
                                    onChange={checked => {
                                      // Move to end of visible list. Leave where it is if itself is the first non visible
                                      const pluginsCopy = [...plugins];
                                      const thisPluginIx = pluginsCopy.findIndex(
                                        p => p.key === el.key
                                      );
                                      const thisPluginToMove = pluginsCopy.splice(
                                        thisPluginIx,
                                        1
                                      );
                                      const firstNonVisiblePluginIx = pluginsCopy.findIndex(
                                        v => !v.visible
                                      );
                                      if (firstNonVisiblePluginIx === -1) {
                                        pluginsCopy.push({
                                          ...thisPluginToMove[0],
                                          visible: false,
                                        });
                                      } else {
                                        pluginsCopy.splice(
                                          firstNonVisiblePluginIx,
                                          0,
                                          {
                                            ...thisPluginToMove[0],
                                            visible: false,
                                          }
                                        );
                                      }

                                      setPlugins(pluginsCopy);
                                    }}
                                  />{' '}
                                  {el.name}
                                </label>
                                <Button
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    width: 'auto',
                                    height: 'auto',
                                    padding: 0,
                                    boxShadow: 'none',
                                    WebkitAppearance: 'none',
                                  }}
                                  title={
                                    el.expanded
                                      ? 'Collapse plugin on load'
                                      : 'Expand plugin on load'
                                  }
                                  onClick={e => {
                                    setPlugins(
                                      plugins.map(p => {
                                        if (p.key === el.key) {
                                          return {
                                            ...p,
                                            expanded: !p.expanded,
                                          };
                                        }
                                        return p;
                                      })
                                    );
                                  }}
                                >
                                  {el.expanded && (
                                    <ArrowsAltOutlined
                                      style={{ color: '#239fd9' }}
                                    />
                                  )}
                                  {!el.expanded && <ShrinkOutlined />}
                                </Button>
                              </Form.Item>
                            </div>
                          )}
                        </Draggable>
                      ))}
                  </Form>
                  {provided.placeholder}
                  <Form>
                    {plugins
                      ?.filter(p => !p.visible)
                      .map((el, ix) => (
                        <Form.Item key={el.key} style={{ marginBottom: 0 }}>
                          <MoreOutlined style={{ color: 'transparent' }} />
                          <label>
                            <Switch
                              size="small"
                              checked={el.visible}
                              title="Show plugin"
                              onChange={() => {
                                // Move to end of visible list. Leave where it is if itself is the first non visible
                                const pluginsCopy = [...plugins];
                                const thisPluginIx = pluginsCopy.findIndex(
                                  p => p.key === el.key
                                );
                                const thisPluginToMove = pluginsCopy.splice(
                                  thisPluginIx,
                                  1
                                );
                                const firstNonVisiblePluginIx = pluginsCopy.findIndex(
                                  v => !v.visible
                                );
                                if (firstNonVisiblePluginIx === -1) {
                                  pluginsCopy.push({
                                    ...thisPluginToMove[0],
                                    visible: true,
                                  });
                                } else {
                                  pluginsCopy.splice(
                                    firstNonVisiblePluginIx,
                                    0,
                                    {
                                      ...thisPluginToMove[0],
                                      visible: true,
                                    }
                                  );
                                }

                                setPlugins(pluginsCopy);
                              }}
                            />{' '}
                            {el.name}
                          </label>
                        </Form.Item>
                      ))}
                  </Form>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Tabs.TabPane>
        <Tabs.TabPane tab="General" key="general">
          <Form {...formItemLayout} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={
                <span>
                  Label{' '}
                  <Tooltip title="A name of your studio">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="label"
              initialValue={label}
              rules={[
                {
                  required: true,
                  message: 'Please input a label!',
                },
              ]}
            >
              <Input className="ui-studio-label-input" />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Description{' '}
                  <Tooltip title="A description of your studio">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="description"
              initialValue={studio?.description}
            >
              <MarkdownEditorFormItemComponent
                resource={studio as Resource}
                onSaveImage={onSaveImage}
                markdownViewer={markdownViewer}
              />
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </>
  );
};

export default StudioEditorForm;

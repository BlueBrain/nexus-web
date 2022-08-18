import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Input, Form, Tooltip, Button, Switch, FormInstance } from 'antd';
import { SaveImageHandler } from 'react-mde';
import {
  CompassFilled,
  MoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import './StudioEditorForm.less';
import { MarkdownEditorFormItemComponent } from '../../../shared/components/MarkdownEditor';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import usePlugins from '../../../shared/hooks/usePlugins';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
  plugins?: {
    customise: boolean;
    plugins: {
      key: string;
      name: string;
      expanded: boolean;
    }[];
  };
}>;

const StudioEditorForm: React.FC<{
  saveStudio?(
    label: string,
    description?: string,
    plugins?: {
      customise: boolean;
      plugins: { key: string; expanded: boolean }[];
    }
  ): void;
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
    const studioConfiguredPlugins =
      studio &&
      studio.plugins &&
      studio.plugins.customise &&
      studio.plugins.plugins
        ? studio.plugins.plugins.map(p => ({ ...p, visible: true }))
        : [];

    const nexusBuiltInPlugins = [
      {
        key: 'video',
        name: 'Video',
      },
      {
        key: 'preview',
        name: 'Preview',
      },
      {
        key: 'admin',
        name: 'Advanced',
      },
      {
        key: 'jira',
        name: 'Jira',
      },
    ];

    /* update studio configured plugins with built-in */
    nexusBuiltInPlugins.forEach(f => {
      const match = studioConfiguredPlugins.find(c => c.key === f.key);
      if (match) {
        // if configured already, just set the name of it
        match.name = f.name;
      } else {
        // not configured, add
        studioConfiguredPlugins.push({
          key: f.key,
          name: f.name,
          visible: false,
          expanded: false,
        });
      }
    });
    const otherAvailablePlugins = Object.keys(pluginManifest || {})
      .map(key => {
        return {
          key,
          name: pluginManifest ? pluginManifest[key].name : '',
          visible: false,
          expanded: false,
        };
      })
      .filter(p => !studioConfiguredPlugins.find(c => c.key === p.key));

    // include names for studio configured plugins
    if (pluginManifest) {
      studioConfiguredPlugins.forEach(p => {
        const match = Object.keys(pluginManifest).find(k => p.key === k);
        if (match) {
          p.name = pluginManifest[match].name;
        }
      });
    }

    setPlugins([...studioConfiguredPlugins, ...otherAvailablePlugins]);
  }, [pluginManifest]);

  const handleSubmit = (values: any) => {
    const visiblePlugins = plugins
      ? plugins
          .filter(p => p.visible)
          .map(p => {
            return { key: p.key, expanded: !!p.expanded };
          })
      : [];

    const { label, description } = values;
    saveStudio &&
      saveStudio(label, description, {
        customise: isPluginsCustomised,
        plugins: visiblePlugins,
      });
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };

  const { label } = studio || {
    label: '',
    description: '',
  };

  const [isPluginsCustomised, setIsPluginsCustomised] = React.useState(false);

  React.useEffect(() => {
    setIsPluginsCustomised(!!(studio?.plugins && studio.plugins.customise));
  }, [studio]);

  const formRef = React.createRef<FormInstance>();

  return (
    <>
      <Form
        {...formItemLayout}
        ref={formRef}
        onFinish={handleSubmit}
        layout="vertical"
      >
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
          <Input aria-label="Label" className="ui-studio-label-input" />
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
        <label className="customise-studio-plugins-label">
          Customise Studio Plugins{' '}
          <Switch
            title="Hide plugin"
            checked={isPluginsCustomised}
            onChange={checked => {
              setIsPluginsCustomised(checked);
            }}
          />{' '}
        </label>
        {isPluginsCustomised && (
          <>
            <p className="custom-plugins">
              <em>
                Overrides the default resource plugin behaviour. Choose which
                plugins to enable, the order in which they appear, and whether
                they display expanded or not.
              </em>
            </p>
            <DragDropContext
              onDragEnd={result => {
                const { destination, source } = result;
                if (!destination || !plugins) {
                  return;
                }
                const pluginsCopy = [...plugins];

                /* enabled plugins should be listed first.
                 It is possible to drag an item into the area of
                 disabled plugins, in which case put at end of
                 enabled list */
                const indexOfLastEnabledPlugin = pluginsCopy.find(
                  p => !p.visible
                )
                  ? pluginsCopy.findIndex(p => !p.visible) - 1
                  : pluginsCopy.length - 1;

                const destinationIndex =
                  destination.index >= indexOfLastEnabledPlugin
                    ? indexOfLastEnabledPlugin + 1
                    : destination.index;

                // add item to array
                pluginsCopy.splice(destinationIndex, 0, plugins[source.index]);

                // remove original item from array
                if (destination.index > source.index) {
                  pluginsCopy.splice(source.index, 1);
                } else {
                  pluginsCopy.splice(source.index + 1, 1);
                }

                setPlugins(pluginsCopy);
              }}
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    className="plugin-options"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <>
                      {plugins?.map((el, ix) => (
                        <Draggable
                          isDragDisabled={!el.visible}
                          key={el.key}
                          draggableId={el.key}
                          index={ix}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`plugin ${!el.name &&
                                'plugin--error'}`}
                            >
                              <Form.Item
                                className="plugin__switch"
                                valuePropName="checked"
                                key={el.key}
                                trigger="onChange"
                              >
                                {el.visible ? (
                                  <>
                                    <MoreOutlined />
                                  </>
                                ) : (
                                  <MoreOutlined
                                    style={{ color: 'transparent' }}
                                  />
                                )}
                                <label className="plugin__label">
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
                                          visible: checked,
                                        });
                                      } else {
                                        pluginsCopy.splice(
                                          firstNonVisiblePluginIx,
                                          0,
                                          {
                                            ...thisPluginToMove[0],
                                            visible: checked,
                                          }
                                        );
                                      }
                                      setPlugins(pluginsCopy);
                                    }}
                                  />{' '}
                                  {el.name ? (
                                    el.name
                                  ) : (
                                    <>
                                      Plugin '<em>{el.key}</em>' not in manifest
                                    </>
                                  )}
                                </label>
                                <Button
                                  className="plugin__expand"
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
                                  {' '}
                                  {el.visible && el.expanded && (
                                    <CompassFilled
                                      style={{ color: '#239fd9' }}
                                    />
                                  )}
                                  {el.visible && !el.expanded && (
                                    <CompassFilled style={{ color: '#ccc' }} />
                                  )}
                                </Button>
                              </Form.Item>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </>
                    {provided.placeholder}
                    <></>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
        <Button type="primary" htmlType="submit" style={{ marginTop: '25px' }}>
          Save
        </Button>
      </Form>
    </>
  );
};

export default StudioEditorForm;

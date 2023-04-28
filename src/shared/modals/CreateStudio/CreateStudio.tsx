import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import {
  Input,
  Form,
  Tooltip,
  Button,
  Switch,
  FormInstance,
  Modal,
  Select,
  Row,
  Col,
  notification,
} from 'antd';
import { useMutation, useQuery } from 'react-query';
import {
  CompassFilled,
  MoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useForm } from 'antd/lib/form/Form';
import { MarkdownEditorFormItemComponent } from '../../../shared/components/MarkdownEditor';
import { updateStudioModalVisibility } from '../../../shared/store/actions/modals';
import { RootState } from '../../../shared/store/reducers';
import { saveImage } from '../../../shared/containers/MarkdownEditorContainer';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import usePlugins from '../../../shared/hooks/usePlugins';
import STUDIO_CONTEXT from '../../../subapps/studioLegacy/components/StudioContext';
import { useStudioLegacySubappContext } from '../../../subapps/studioLegacy';

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
type TCreationStudio = {
  isPluginsCustomised: boolean;
  selectAllPlugin: boolean;
  organization?: string;
  project?: string;
  plugins: {
    key: string;
    name: string;
    visible: boolean | undefined;
    expanded: boolean | undefined;
  }[];
};
type TCreationStudioForm = {
  organizationName: string;
  projectName: string;
  label: string;
  description: string;
};
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};
const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const generateStudioResource = (
  label: string,
  description?: string,
  plugins?: {
    customise: boolean;
    plugins: { key: string; expanded: boolean }[];
  }
) => ({
  label,
  description,
  plugins,
  '@context': STUDIO_CONTEXT['@id'],
  '@type': DEFAULT_STUDIO_TYPE,
});
const makeStudioContext = async ({
  nexus,
  organization,
  project,
}: {
  nexus: NexusClient;
  organization: string;
  project: string;
}) => {
  try {
    await nexus.Resource.get(
      organization!,
      project!,
      encodeURIComponent(STUDIO_CONTEXT['@id'])
    );
  } catch (error) {
    // @ts-ignore
    if (error['@type'] === 'ResourceNotFound') {
      await nexus.Resource.create(organization!, project!, {
        ...STUDIO_CONTEXT,
      });
      return;
    }
    throw error;
  }
};
const createStudioResource = async ({
  nexus,
  organization,
  project,
  label,
  description,
  plugins,
}: {
  nexus: NexusClient;
  organization: string;
  project: string;
  label: string;
  description?: string;
  plugins?: {
    customise: boolean;
    plugins: { key: string; expanded: boolean }[];
  };
}) => {
  try {
    await makeStudioContext({ nexus, project, organization });
    return await nexus.Resource.create(
      organization!,
      project!,
      generateStudioResource(label, description, plugins)
    );
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not process create studio request', { cause: error });
  }
};

const CreateStudio = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const { data: pluginManifest } = usePlugins();
  const [form] = useForm();
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const { identities } = useSelector((state: RootState) => state.auth);
  const userUri = identities?.data?.identities.find(
    t => t['@type'] === 'User'
  )?.['@id'];
  const { isCreateStudioModelVisible } = useSelector(
    (state: RootState) => state.modals
  );
  const { namespace } = useStudioLegacySubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${namespace}/:orgLabel/:projectLabel/studios`
  );
  const orgLabel = match?.params.orgLabel;
  const projectLabel = match?.params.projectLabel;
  const goToStudio = (resourceId: string) =>
    history.push(makeStudioUri(resourceId));
  const { mutateAsync: mutateStudioResource, status } = useMutation(
    createStudioResource
  );
  const handleSubmit = ({
    description,
    label,
    organizationName,
    projectName,
  }: TCreationStudioForm) => {
    const visiblePlugins = plugins
      .filter(p => p.visible)
      .map(p => {
        return { key: p.key, expanded: !!p.expanded };
      });
    mutateStudioResource(
      {
        nexus,
        label,
        description,
        organization: organizationName ?? orgLabel,
        project: projectName ?? projectLabel,
        plugins: {
          customise: isPluginsCustomised,
          plugins: visiblePlugins,
        },
      },
      {
        onSuccess: (data: any) => {
          dispatch(updateStudioModalVisibility(false));
          goToStudio(data['@id']);
        },
        onError: error => {
          notification.error({
            message: `An error occured when creating a new studio for ${organizationName ??
              orgLabel}/${projectName ?? projectLabel}`,
            // @ts-ignore
            description: error.cause?.message,
          });
        },
      }
    );
  };

  const [
    { isPluginsCustomised, plugins, selectAllPlugin, project, organization },
    updateState,
  ] = React.useReducer(
    (previous: TCreationStudio, next: Partial<TCreationStudio>) => ({
      ...previous,
      ...next,
    }),
    {
      isPluginsCustomised: false,
      selectAllPlugin: false,
      organization: undefined,
      project: undefined,
      plugins: [],
    }
  );
  const makeStudioUri = (resourceId: string) => {
    const path = `${basePath}/studios/${organization ?? orgLabel}/${project ??
      projectLabel}/studios/${encodeURIComponent(resourceId)}`;
    return path;
  };
  const customisePlugin = (value: boolean) =>
    updateState({ isPluginsCustomised: value });
  const handleSelectAllPlugin = (checked: boolean) => {
    if (checked) {
      updateState({
        plugins: plugins.map(plug => ({
          ...plug,
          visible: true,
          expanded: true,
        })),
        selectAllPlugin: true,
      });
    } else {
      updateState({
        plugins: plugins.map(plug => ({
          ...plug,
          visible: false,
          expanded: false,
        })),
        selectAllPlugin: false,
      });
    }
  };
  const { data: organizations, status: orgStatus } = useQuery({
    queryKey: ['user-organizations', { user: userUri! }],
    queryFn: () =>
      nexus.Organization.list({
        createdBy: userUri,
        deprecated: false,
      }),
  });
  const { data: projects, status: projStatus } = useQuery({
    enabled: orgStatus === 'success' && !!organizations && !!organization,
    queryKey: ['user-org/projects', { organization, user: userUri! }],
    queryFn: () =>
      nexus.Project.list(organization, {
        createdBy: userUri,
        deprecated: false,
      }),
  });
  const handleChangeOrganization = (value: string) => {
    updateState({ organization: value, project: undefined });
    form.setFieldsValue({ orgLabel: value, projectLabel: undefined });
  };
  const handleChangeProject = (value: string) => {
    updateState({ project: value });
    form.setFieldsValue({ projectLabel: value });
  };
  const updateVisibility = () => dispatch(updateStudioModalVisibility(false));
  React.useEffect(() => {
    const nexusBuiltInPlugins = [
      {
        key: 'video',
        name: 'Video',
        visible: false,
        expanded: false,
      },
      {
        key: 'preview',
        name: 'Preview',
        visible: false,
        expanded: false,
      },
      {
        key: 'admin',
        name: 'Advanced',
        visible: false,
        expanded: false,
      },
      {
        key: 'jira',
        name: 'Jira',
        visible: false,
        expanded: false,
      },
    ];
    const otherAvailablePlugins = Object.keys(pluginManifest || {})
      .map(key => {
        return {
          key,
          name: pluginManifest ? pluginManifest[key].name : '',
          visible: false,
          expanded: false,
        };
      })
      .filter(p => !nexusBuiltInPlugins.find(c => c.key === p.key));
    if (pluginManifest) {
      nexusBuiltInPlugins.forEach(p => {
        const match = Object.keys(pluginManifest).find(k => p.key === k);
        if (match) {
          p.name = pluginManifest[match].name;
        }
      });
    }

    updateState({
      plugins: [...nexusBuiltInPlugins, ...otherAvailablePlugins],
    });
  }, [pluginManifest]);
  return (
    <Modal
      centered
      closable
      destroyOnClose
      forceRender
      open={isCreateStudioModelVisible}
      onCancel={updateVisibility}
      title={<strong>Create Studio</strong>}
      footer={null}
      width={800}
      bodyStyle={{ padding: '10px 24px' }}
      afterClose={() => {
        form.resetFields();
        updateState({
          isPluginsCustomised: false,
          selectAllPlugin: false,
          organization: undefined,
          project: undefined,
          plugins: [],
        });
      }}
    >
      <Form<TCreationStudioForm>
        {...formItemLayout}
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Row gutter={4}>
          <Col span={isPluginsCustomised ? 12 : 24}>
            {!(orgLabel && projectLabel) && (
              <React.Fragment>
                <Form.Item
                  key="studio-Orgnanization"
                  style={{ marginBottom: 5 }}
                  label="Organization"
                  name="organizationName"
                  initialValue={orgLabel ?? undefined}
                  rules={[
                    {
                      required: true,
                      message: 'Please select an organization!',
                    },
                  ]}
                >
                  <Select
                    placeholder="Select organization"
                    loading={orgStatus === 'loading'}
                    onSelect={handleChangeOrganization}
                    defaultValue={orgLabel ?? undefined}
                    aria-label="select-organization"
                  >
                    <Select.Option value={''}>{''}</Select.Option>
                    {organizations?._results.map(org => (
                      <Select.Option value={org._label} key={org['@id']}>
                        {org._label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  key="studio-project"
                  style={{ marginBottom: 5 }}
                  label={<span> Project </span>}
                  name="projectName"
                  initialValue={projectLabel ?? undefined}
                  rules={[
                    {
                      required: true,
                      message: 'Please select a project!',
                    },
                  ]}
                >
                  <Select
                    placeholder="Select project"
                    loading={projStatus === 'loading'}
                    defaultValue={projectLabel ?? undefined}
                    onSelect={handleChangeProject}
                  >
                    <Select.Option value={''}>{''}</Select.Option>
                    {projects?._results.map(proj => (
                      <Select.Option value={proj._label} key={proj['@id']}>
                        {proj._label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </React.Fragment>
            )}
            <Form.Item
              key="studio-name"
              style={{ marginBottom: 5 }}
              label={
                <span>
                  Label
                  <Tooltip title="A name of your studio">
                    <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                  </Tooltip>
                </span>
              }
              name="label"
              initialValue={''}
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
              key="studio-description"
              style={{ marginBottom: 5 }}
              label={
                <span>
                  Description
                  <Tooltip title="A description of your studio">
                    <QuestionCircleOutlined style={{ marginLeft: 5 }} />
                  </Tooltip>
                </span>
              }
              name="description"
              initialValue={''}
            >
              <MarkdownEditorFormItemComponent
                resource={{} as Resource}
                rmeProps={{
                  maxEditorHeight: 300,
                }}
                onSaveImage={saveImage(
                  nexus,
                  form.getFieldValue('orgLabel'),
                  form.getFieldValue('projectLabel')
                )}
                markdownViewer={MarkdownViewerContainer}
              />
            </Form.Item>
            <Form.Item key="studio-has-plugins" style={{ marginBottom: 5 }}>
              <label className="customise-studio-plugins-label">
                Customise Studio Plugins
                <Switch
                  title="Hide plugin"
                  checked={isPluginsCustomised}
                  onChange={value => customisePlugin(value)}
                  style={{ marginLeft: 10 }}
                />
              </label>
            </Form.Item>
            <Form.Item style={{ margin: '10px 0 0' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={status === 'loading'}
              >
                Save
              </Button>
            </Form.Item>
          </Col>
          {isPluginsCustomised && (
            <Col span={12}>
              <p className="custom-plugins">
                <em>
                  Overrides the default resource plugin behaviour. Choose which
                  plugins to enable, the order in which they appear, and whether
                  they display expanded or not.
                </em>
              </p>
              <label
                className="plugin__label"
                style={{ marginLeft: 14, marginBottom: 15 }}
              >
                <Switch
                  key="studio-plugin-all"
                  title="select all plugin"
                  size="small"
                  checked={selectAllPlugin}
                  onChange={handleSelectAllPlugin}
                  style={{
                    marginRight: 5,
                    backgroundColor: selectAllPlugin ? 'black' : '#BCBCBC',
                  }}
                />
                {selectAllPlugin ? 'Unselect All' : 'Select All'}
              </label>
              <DragDropContext
                onDragEnd={result => {
                  const { destination, source } = result;
                  if (!destination || !plugins) {
                    return;
                  }
                  const pluginsCopy = [...plugins];
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
                  pluginsCopy.splice(
                    destinationIndex,
                    0,
                    plugins[source.index]
                  );

                  // remove original item from array
                  if (destination.index > source.index) {
                    pluginsCopy.splice(source.index, 1);
                  } else {
                    pluginsCopy.splice(source.index + 1, 1);
                  }

                  updateState({ plugins: pluginsCopy });
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
                                  style={{ marginBottom: 3 }}
                                >
                                  {el.visible ? (
                                    <MoreOutlined />
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
                                        updateState({
                                          plugins: pluginsCopy,
                                          selectAllPlugin: false,
                                        });
                                      }}
                                      style={{ marginRight: 5 }}
                                    />
                                    {el.name ? (
                                      el.name
                                    ) : (
                                      <>
                                        Plugin '<em>{el.key}</em>' not in
                                        manifest
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
                                      updateState({
                                        plugins: plugins.map(p => {
                                          if (p.key === el.key) {
                                            return {
                                              ...p,
                                              expanded: !p.expanded,
                                            };
                                          }
                                          return p;
                                        }),
                                      });
                                    }}
                                  >
                                    {el.visible && el.expanded && (
                                      <CompassFilled
                                        style={{
                                          color: '#239fd9',
                                          marginLeft: 3,
                                        }}
                                      />
                                    )}
                                    {el.visible && !el.expanded && (
                                      <CompassFilled
                                        style={{ color: '#ccc', marginLeft: 3 }}
                                      />
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
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateStudio;

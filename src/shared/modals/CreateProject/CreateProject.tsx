import * as React from 'react';
import {
  Input,
  Modal,
  Row,
  notification,
  Button,
  Col,
  Collapse,
  Form,
  Select,
  Space,
} from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { NexusClient, ProjectResponseCommon } from '@bbp/nexus-sdk/es';
import { useMutation, useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useOrganisationsSubappContext } from '../../../subapps/admin';
import {
  ModalsActionsEnum,
  updateProjectModalVisibility,
} from '../../../shared/store/actions/modals';
import { RootState } from '../../../shared/store/reducers';

type TProject = {
  organization: string;
  label: string;
  description: string;
  base: string;
  vocab: string;
  apiMappings?: ProjectResponseCommon['apiMappings'];
};
type TCreateProject = TProject & {
  nexus: NexusClient;
  orgLabel: string;
};
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};
const PrefixMappingGroupInput: React.FC<{
  groupId: number;
  value?: any;
}> = ({ groupId, value }) => {
  return (
    <Space.Compact className="project-form__item-inputs">
      <Form.Item
        noStyle
        name={['apiMappings', `apiMappings[${groupId - 1}]`, 'prefix']}
        rules={[
          {
            required: true,
            message: 'You need to specify prefix',
          },
        ]}
        initialValue={value.prefix}
      >
        <Input
          style={{ width: '33%', background: 'white', marginRight: 10 }}
          placeholder="prefix"
        />
      </Form.Item>
      <Form.Item
        noStyle
        name={['apiMappings', `apiMappings[${groupId - 1}]`, 'namespace']}
        rules={[
          {
            required: true,
            message: 'You need to specify namespace',
          },
        ]}
        initialValue={value.namespace}
      >
        <Input
          style={{ width: '60%', background: 'white' }}
          placeholder="namespace"
        />
      </Form.Item>
    </Space.Compact>
  );
};

const createProjectMutation = async ({
  nexus,
  orgLabel,
  label,
  description,
  base,
  vocab,
  apiMappings,
}: Omit<TCreateProject, 'organization'>) => {
  try {
    return await nexus.Project.create(orgLabel, label, {
      base: base || undefined,
      vocab: vocab || undefined,
      description: description || undefined,
      apiMappings: apiMappings || undefined,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error(`Error when creating new project in ${orgLabel}`, {
      cause: error,
    });
  }
};

const CreateProject: React.FC<{}> = ({}) => {
  const dispatch = useDispatch();
  const nexus = useNexusContext();
  const history = useHistory();
  const { identities } = useSelector((state: RootState) => state.auth);

  const userUri = identities?.data?.identities.find(
    t => t['@type'] === 'User'
  )?.['@id'];
  const [form] = Form.useForm<TProject>();
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{ orgLabel: string }>(
    `/${subapp.namespace}/:orgLabel`
  );
  const { isCreateProjectModelVisible } = useSelector(
    (state: RootState) => state.modals
  );
  const orgLabel = match?.params.orgLabel;
  const currentId = 0;
  const activeKeys = [...Array(currentId + 1).keys()].slice(1);
  const [prefixMappingKeys, setPrefixMappingKeys] = React.useState({
    currentId,
    activeKeys,
  });

  const add = (k: any) => {
    const { currentId, activeKeys } = prefixMappingKeys;
    const newId: number = currentId + 1;
    // @ts-ignore
    setPrefixMappingKeys({
      currentId: newId,
      activeKeys: [...activeKeys, newId],
    });
  };

  const remove = (k: any) => {
    const { activeKeys } = prefixMappingKeys;
    setPrefixMappingKeys({
      ...prefixMappingKeys,
      activeKeys: activeKeys.filter((key: any) => key !== k),
    });
  };
  const { data: organizations, isLoading } = useQuery({
    enabled: isCreateProjectModelVisible && !!userUri,
    queryKey: ['user-organizations', { user: userUri! }],
    queryFn: () =>
      nexus.Organization.list({
        createdBy: userUri,
        deprecated: false,
      }),
  });

  const { mutateAsync, status } = useMutation(createProjectMutation);
  const handleSubmit = ({
    organization,
    label,
    description,
    base,
    vocab,
    apiMappings,
  }: TProject) => {
    const mappingObject = apiMappings || {};
    const apiMappingsArray = Object.keys(mappingObject).map(
      (mapping: any) => apiMappings![mapping]
    );
    mutateAsync(
      {
        nexus,
        base,
        vocab,
        label,
        description,
        apiMappings: apiMappingsArray ?? undefined,
        orgLabel: orgLabel ?? organization,
      },
      {
        onSuccess: data => {
          form.resetFields();
          dispatch({
            type: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
            payload: false,
          });
          notification.success({
            duration: 2,
            message: <strong>{data._label}</strong>,
            description: `Project has been created Successfully`,
            onClose: () => {
              history.push(`/orgs/${orgLabel ?? organization}/${data._label}`);
            },
          });
        },
        onError: error => {
          form.resetFields();
          notification.error({
            duration: 3,
            // @ts-ignore
            message: error.message,
            // @ts-ignore
            description: <strong>{error.cause['@type']}</strong>,
          });
        },
      }
    );
  };
  const apiMappingsItems = prefixMappingKeys.activeKeys.map(
    (key: number, index: number) => (
      <Form.Item key={key}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <PrefixMappingGroupInput
            groupId={key}
            value={{
              prefix: '',
              namespace: '',
            }}
          />
          {prefixMappingKeys.activeKeys.length > 0 ? (
            <MinusCircleOutlined
              style={{ color: 'red' }}
              onClick={() => remove(key)}
            />
          ) : null}
        </div>
      </Form.Item>
    )
  );

  const updateVisibility = () => dispatch(updateProjectModalVisibility(false));
  return (
    <Modal
      centered
      closable
      destroyOnClose
      open={isCreateProjectModelVisible}
      onCancel={updateVisibility}
      footer={null}
      title={<strong>Create Project</strong>}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <Form<TProject>
        className="project-form"
        onFinish={handleSubmit}
        form={form}
        autoComplete="off"
      >
        {!orgLabel && (
          <Form.Item
            {...formItemLayout}
            label="Orgnanization"
            name="organization"
            initialValue={orgLabel ?? ''}
            required
          >
            <Select
              placeholder="Select organization"
              loading={isLoading}
              defaultValue={orgLabel ?? ''}
            >
              <Select.Option value={''}>{''}</Select.Option>
              {organizations?._results.map(org => (
                <Select.Option value={org._label} key={org['@id']}>
                  {org._label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          {...formItemLayout}
          label="Label"
          name="label"
          initialValue={''}
          rules={[
            {
              required: true,
              whitespace: true,
              pattern: /^\S+$/g,
              message: 'Label must be a phrase without spaces',
            },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message:
                'Label should include only letters, numbers, underscores, and dashes.',
            },
          ]}
        >
          <Input placeholder="Label" />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Description"
          name="description"
          initialValue={''}
          rules={[{ required: false }]}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Base"
          name="base"
          initialValue={''}
          rules={[{ required: false }]}
        >
          <Input placeholder="Base" />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Vocab"
          name="vocab"
          initialValue={''}
          rules={[{ required: false }]}
        >
          <Input placeholder="Vocab" />
        </Form.Item>
        <Collapse
          style={{ margin: '0 -24px' }}
          bordered={false}
          ghost
          items={[
            {
              key: '1',
              label: 'Advanced settings',
              children: (
                <>
                  <h4>
                    API Mappings
                    <PlusCircleOutlined
                      onClick={add}
                      style={{ marginLeft: 20, color: 'blue' }}
                    />
                  </h4>
                  {apiMappingsItems}
                </>
              ),
            },
          ]}
        />
        <Row justify="end" gutter={16}>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === 'loading'}
            >
              Create
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateProject;

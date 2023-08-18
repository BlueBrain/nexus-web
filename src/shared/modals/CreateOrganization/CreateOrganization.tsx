import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Modal, Input, Button, notification } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk/es';
import { useMutation } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory } from 'react-router';
import { useOrganisationsSubappContext } from '../../../subapps/admin';
import { RootState } from '../../store/reducers';
import {
  ModalsActionsEnum,
  updateOrganizationModalVisibility,
} from '../../../shared/store/actions/modals';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 19, offset: 5 },
  },
};
const createOrganizationMutation = async ({
  nexus,
  label,
  description,
}: {
  nexus: NexusClient;
  label: string;
  description: string;
}) => {
  try {
    return await nexus.Organization.create(label, { description });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not create new organization', { cause: error });
  }
};

const CreateOrganization: React.FC<{}> = () => {
  const history = useHistory();
  const nexus = useNexusContext();
  const subapp = useOrganisationsSubappContext();
  const dispatch = useDispatch();
  const { isCreateOrganizationModelVisible } = useSelector(
    (state: RootState) => state.modals
  );
  const [form] = Form.useForm<{ label: string; description: string }>();
  const { mutateAsync, status } = useMutation(createOrganizationMutation);
  const handleSubmit = (values: { label: string; description: string }) =>
    mutateAsync(
      {
        nexus,
        label: values.label,
        description: values.description,
      },
      {
        onSuccess: data => {
          form.resetFields();
          dispatch(updateOrganizationModalVisibility(false));
          notification.success({
            duration: 1,
            message: <strong>{data._label}</strong>,
            description: `Organisation has been created Successfully`,
            onClose: () => {
              history.push(`/${subapp.namespace}/${data._label}`);
            },
          });
        },
        onError: error => {
          notification.error({
            duration: 3,
            // @ts-ignore
            message: error.message,
            // @ts-ignore
            description: <strong>{error.cause['@type']}</strong>,
            onClick: () => form.resetFields(),
            onClose: () => form.resetFields(),
          });
        },
      }
    );
  const updateVisibility = () =>
    dispatch(updateOrganizationModalVisibility(false));
  return (
    <Modal
      centered
      closable
      destroyOnClose
      open={isCreateOrganizationModelVisible}
      onCancel={updateVisibility}
      footer={null}
      title={<strong>Create Organization</strong>}
      afterClose={() => {
        form.resetFields();
      }}
    >
      <Form form={form} onFinish={handleSubmit} autoComplete="off">
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
              message: 'Label must contains only letters and numbers',
            },
          ]}
        >
          <Input placeholder="Label" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={''}
          rules={[{ required: false }]}
          {...formItemLayout}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
            loading={status === 'loading'}
          >
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOrganization;

import * as React from 'react';
import {
  Form,
  Icon,
  Input,
  Button,
  Spin,
  Modal,
  AutoComplete,
  notification,
} from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Resource, Project } from '@bbp/nexus-sdk';

const Option = AutoComplete.Option;

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface CreateResourcePayload {
  resourceId?: string;
  type?: string[];
  context: { [field: string]: string };
  [field: string]: any;
}

export interface ResourceFormProps {
  form: WrappedFormUtils;
  resource?: {
    schemaId: string;
    payload: CreateResourcePayload;
  };
  schemas: { key: string; count: number }[];
  busy?: boolean;
  onSubmit?(resource: ResourceFormProps['resource']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
const ResourceForm: React.FunctionComponent<ResourceFormProps> = ({
  form,
  resource,
  schemas,
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
  mode = 'create',
}) => {
  const [jsonValue, setJsonValue] = React.useState({
    context: {},
  });
  const { getFieldDecorator, getFieldValue } = form;
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

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const payload = {
          type: values.type,
          resourceId: values['@id'],
          context: values.context,
          ...jsonValue,
        };
        onSubmit({
          payload,
          schemaId: values.schemaId,
        });
      }
    });
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Project',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  const handleJSONInput = ({ updated_src }: any) => {
    setJsonValue(updated_src);
    return jsonValue;
  };

  return (
    <Spin spinning={busy}>
      <Form onSubmit={handleSubmit}>
        <Form.Item label="@id" {...formItemLayout}>
          {getFieldDecorator('@id', {
            rules: [{ required: false }],
          })(
            <Input placeholder="Add your own @id" disabled={mode === 'edit'} />
          )}
        </Form.Item>
        <Form.Item {...formItemLayout} label="schema">
          {getFieldDecorator('schemaId', {
            rules: [
              {
                required: true,
                message: 'Please select a schema!',
                type: 'string',
              },
            ],
          })(
            <AutoComplete
              className="certain-category-search"
              dropdownClassName="certain-category-search-dropdown"
              dropdownMatchSelectWidth={false}
              dataSource={schemas.map(({ key, count }) => (
                <Option key={key}>
                  <div className="schema-value">
                    <div>{key}</div> <div className="count">{count}</div>
                  </div>
                </Option>
              ))}
              placeholder={`constrain by Schema`}
              optionLabelProp="value"
            />
          )}
        </Form.Item>
        <ReactJson
          src={jsonValue}
          name={null}
          onEdit={handleJSONInput}
          onAdd={handleJSONInput}
          onDelete={handleJSONInput}
        />
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Save
          </Button>
          {mode === 'edit' && (
            <Button
              type="danger"
              onClick={confirmDeprecate}
              style={{ float: 'right' }}
            >
              Deprecate
            </Button>
          )}
        </Form.Item>
      </Form>
    </Spin>
  );
};

export const ResourceFormContainer = Form.create()(ResourceForm);

interface ResourceFormModalProps {
  project: any;
  render: (updateFormVisible: () => void) => React.ReactElement<any>;
  onSuccess?: () => void;
}

const ResourceFormModal: React.FunctionComponent<ResourceFormModalProps> = ({
  project,
  render,
  onSuccess = () => {},
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [formBusy, setFormBusy] = React.useState(false);
  const saveAndCreate = async (resourceToCreate: any) => {
    const { schemaId, payload } = resourceToCreate;
    setFormBusy(true);
    try {
      const resource = await Resource.create(
        project.orgLabel,
        project.label,
        encodeURIComponent(schemaId),
        payload
      );
      notification.success({
        message: 'Resource saved',
        description: resource.name,
        duration: 2,
      });
      onSuccess();
      setModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'An unknown error occurred',
        description: error.message,
        duration: 0,
      });
      setFormBusy(false);
    }
  };
  const updateFormVisible = () => {
    setModalVisible(!modalVisible);
  };
  return (
    <>
      <Modal
        title="New Resource"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        confirmLoading={formBusy}
        footer={null}
      >
        <ResourceFormContainer
          schemas={project['_constrainedBy']}
          onSubmit={(r: any) => saveAndCreate(r)}
          busy={formBusy}
        />
      </Modal>
      {render(updateFormVisible)}
    </>
  );
};

export default ResourceFormModal;

import * as React from 'react';
import { Cascader, Form, Button, Spin, Modal } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { CreateResourcePayload } from '@bbp/nexus-sdk/lib/Resource/types';
import ResourceEditor from './ResourceEditor';
import { CascaderOptionType } from 'antd/lib/cascader';
import {
  DEFAULT_RESOURCE,
  RESOURCES_SCHEMA_URI,
  DEFAULT_RESOURCES,
} from './defaultResourcePayloads';

import './ResourceForm.less';

const AVAILABLE_SCHEMAS: CascaderOptionType[] = [
  {
    value: '_',
    label: 'Any Resource',
  },
  {
    value: 'Storage',
    label: 'Storage',
    children: [
      { value: 'DiskStorage', label: 'Disk Storage' },
      { value: 'RemoteStorage', label: 'Remote Storage' },
      { value: 'S3Storage', label: 'S3 Storage' },
    ],
  },
  {
    value: 'View',
    label: 'View',
    children: [
      { value: 'SparqlView', label: 'Sparql View' },
      { value: 'ElasticSearchView', label: 'ElasticSearch View' },
      { value: 'AggregateSparqlView', label: 'Aggregate Sparql View' },
      {
        value: 'AggregateElasticSearchView',
        label: 'Aggregate ElasticSearch View',
      },
    ],
  },
  {
    value: 'Resolver',
    label: 'Resolver',
    children: [
      { value: 'InProject', label: 'In Project' },
      { value: 'CrossProject', label: 'Cross Project' },
    ],
  },
];

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

export interface ResourceFormProps {
  form: WrappedFormUtils;
  resource?: {
    schemaId: string;
    payload: CreateResourcePayload;
  };
  busy?: boolean;
  onSubmit?(resource: {
    schemaId: string;
    payload: CreateResourcePayload;
  }): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
const ResourceForm: React.FunctionComponent<ResourceFormProps> = ({
  form,
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
  mode = 'create',
}) => {
  const [jsonValue, setJsonValue] = React.useState<{ [key: string]: any }>(
    DEFAULT_RESOURCE
  );
  const { getFieldDecorator } = form;

  const handleSubmit = (rawData: any) => {
    form.setFieldsValue({ editorContent: rawData });
    form.validateFields((err, values) => {
      if (!err && !busy) {
        const { resourceTypes, editorContent } = values;
        const selectedSchema: string =
          resourceTypes.find((type: string) =>
            Object.keys(RESOURCES_SCHEMA_URI).includes(type)
          ) || '_';

        const payload = {
          ...editorContent,
          type: resourceTypes,
        };
        onSubmit({
          payload,
          schemaId: RESOURCES_SCHEMA_URI[selectedSchema],
        });
      }
    });
  };

  const handleTypeChange = (types: string[]) => {
    const selectedType: string =
      types.find(type => Object.keys(DEFAULT_RESOURCES).includes(type)) || '_';
    setJsonValue(DEFAULT_RESOURCES[selectedType]);
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Resource',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  return (
    <Spin spinning={busy}>
      <Form className="ResourceForm">
        <Form.Item label="Resource Type" {...formItemLayout}>
          {getFieldDecorator('resourceTypes', {
            rules: [{ required: true }],
          })(
            <Cascader
              options={AVAILABLE_SCHEMAS}
              disabled={mode === 'edit'}
              onChange={handleTypeChange}
            />
          )}
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          {getFieldDecorator('editorContent', {
            rules: [{ required: false }],
          })(
            <ResourceEditor
              editable={true}
              rawData={jsonValue}
              onSubmit={handleSubmit}
            />
          )}
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
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

export default Form.create<ResourceFormProps>()(ResourceForm);

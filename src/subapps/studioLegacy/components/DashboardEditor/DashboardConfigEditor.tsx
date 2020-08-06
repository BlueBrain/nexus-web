import * as React from 'react';
import { Input, Form, Tooltip, Icon, Button, Collapse, Select } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ResourceList } from '@bbp/nexus-sdk';
import { FormComponentProps } from 'antd/es/form';
import TextArea from 'antd/lib/input/TextArea';

import DEFAULT_DASHBOARD_VIEW_QUERY from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../../../admin/components/ViewForm/SparqlQueryInput';

const { Option } = Select;

export type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
  plugins?: string[];
};

export type DashboardConfigEditorProps = {
  ref?: React.Ref<FormComponentProps<any>>;
  form: WrappedFormUtils;
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  viewList?: ResourceList<{}>;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
  availablePlugins?: string[];
};

const dashboardSPARQLDocumentationURL =
  'https://github.com/BlueBrain/nexus-web/blob/master/docs/studio/Dashboards.md#sparql-query-requirements';

const DashboardConfigEditorComponent: React.FunctionComponent<DashboardConfigEditorProps> = ({
  onSubmit,
  form,
  dashboard,
  linkToSparqlQueryEditor,
}) => {
  const { description, label, dataQuery, plugins = [] } = dashboard || {};
  const { getFieldDecorator, getFieldsValue, validateFields } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(err => {
      if (!err) {
        const { description, label, dataQuery } = getFieldsValue() as {
          description?: string;
          label: string;
          dataQuery: string;
        };
        onSubmit &&
          onSubmit({
            description,
            label,
            dataQuery,
          });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="What do you want to call this dashboard?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('label', {
          initialValue: label,
          rules: [
            {
              required: true,
              message: 'Please input a label!',
            },
          ],
        })(<Input className="ui-dashboard-label-input" />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A short description of what's in the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          initialValue: description,
          rules: [
            {
              required: false,
            },
          ],
        })(<TextArea className="ui-dashboard-description-input" />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Sparql Query{' '}
            <Tooltip title="A query that will return the elements of the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>{' '}
            {linkToSparqlQueryEditor &&
              linkToSparqlQueryEditor(
                dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY
              )}
            {' | '}
            <a href={dashboardSPARQLDocumentationURL} target="_blank">
              Read Docs
            </a>
          </span>
        }
      >
        {getFieldDecorator('dataQuery', {
          initialValue: dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY,
          rules: [
            {
              required: true,
            },
          ],
        })(<SparqlQueryFormInput />)}
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Form.create<DashboardConfigEditorProps>()(
  DashboardConfigEditorComponent
);

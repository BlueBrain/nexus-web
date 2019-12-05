import * as React from 'react';
import { Input, Form, Tooltip, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ResourceList } from '@bbp/nexus-sdk';
import DEFAULT_DASHBOARD_VIEW_QUERY from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../ViewForm/SparqlQueryInput';

export type DashboardPayload = {
  description?: string;
  label: string;
  viewQuery: string;
};

const DashboardConfigEditorComponent: React.FunctionComponent<{
  form: WrappedFormUtils;
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
}> = ({ onSubmit, form, dashboard }) => {
  const { description, label, viewQuery } = dashboard || {};
  const { getFieldDecorator, getFieldsValue, validateFields } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(err => {
      if (!err) {
        const { description, label, viewQuery } = getFieldsValue() as {
          description?: string;
          label: string;
          viewQuery: string;
        };
        onSubmit &&
          onSubmit({
            description,
            label,
            viewQuery,
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
        })(<Input />)}
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
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Sparql Query{' '}
            <Tooltip title="A query that will return the elements of the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('viewQuery', {
          initialValue: viewQuery || DEFAULT_DASHBOARD_VIEW_QUERY,
          rules: [
            {
              required: true,
            },
          ],
          // @ts-ignore no possible way to fix this typescript nonsense
        })(<SparqlQueryFormInput />)}
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default Form.create<{
  form: WrappedFormUtils;
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  viewList?: ResourceList<{}>;
}>()(DashboardConfigEditorComponent);

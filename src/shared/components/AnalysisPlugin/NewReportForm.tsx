import * as React from 'react';
import { Form, Button, Input } from 'antd';
import './NewReportForm.less';
import CategoryWidget from './CategoryWidget';
import TypeWidget from './TypeWidget';
import { without } from 'lodash';

import {
  initialize,
  saveReport,
} from '../../slices/plugins/report';

const { TextArea } = Input;

type NewReportFormProps = {
  analysisReportId?: string | undefined;
  imagePreviewScale: number;
  onSave: (
    name: string,
    description?: string,
    id?: string,
    categories?: string[],
    types?: string[]
  ) => void;
  dispatch: (params: any) => void;
};

const NewReportForm = ({
  analysisReportId,
  dispatch,
  onSave,
  imagePreviewScale,
}: NewReportFormProps) => {
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  const selectCategory = (value: string) => {
    !selectedCategories.includes(value)
      ? setSelectedCategories([...selectedCategories, value])
      : setSelectedCategories(without(selectedCategories, value));
  };
  const selectType = (value: string) => {
    !selectedTypes.includes(value)
      ? setSelectedTypes([...selectedTypes, value])
      : setSelectedTypes(without(selectedTypes, value));
  };
  const onFinish = (data: any) => {
    data.categories = selectedCategories;
    data.types = selectedTypes;
    console.log('selectedTypes:', selectedTypes);
    console.log('on finish', data);
    dispatch(saveReport({ payload: data }));
    onSave(data);
  };
  return (
    <Form layout={'vertical'} onFinish={onFinish} className="new-report-form">
      <Form.Item label="Report Name" name="name">
        <Input placeholder="type name here" />
      </Form.Item>
      <Form.Item label="Report Description" name="description">
        <TextArea rows={10} />
      </Form.Item>
      <Form.Item label="Categories">
        <CategoryWidget
          dispatch={dispatch}
          mode={'create'}
          selectedCategories={selectedCategories}
          selectCategory={selectCategory}
        />
      </Form.Item>
      <Form.Item label="Types">
        <TypeWidget
          dispatch={dispatch}
          mode={'create'}
          selectedTypes={selectedTypes}
          selectType={selectType}
        />
      </Form.Item>
      <Form.Item className="action-buttons">
        <span className="action-buttons">
          <Button
            style={{ marginRight: '10px' }}
            type="default"
            aria-label="Cancel"
            className="cancel-button"
            onClick={() =>
              dispatch(
                initialize({
                  scale: imagePreviewScale,
                  analysisReportId: analysisReportId ? [analysisReportId] : [],
                })
              )
            }
          >
            Cancel
          </Button>
          <Button
            aria-label="Save"
            type="primary"
            htmlType="submit"
            className="save-button"
            size="large"
          >
            Save
          </Button>
        </span>
      </Form.Item>
    </Form>
  );
};

export default NewReportForm;

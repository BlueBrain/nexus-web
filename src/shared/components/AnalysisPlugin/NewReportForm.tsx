import * as React from 'react';
import { Form, Button, Input} from 'antd';
import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';
import './NewReportForm.less';
import CategoryWidget from './CategoryWidget';
import { without } from 'lodash';

const { TextArea } = Input;

type NewReportFormProps = {
    analysisReportId?: string | undefined;
    imagePreviewScale: number;
  dispatch: (action: AnalysesAction) => void;
};

const NewReportForm = ({
  analysisReportId,
  dispatch,
  imagePreviewScale,
}: NewReportFormProps) => {
  const [form] = Form.useForm();
const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
  []
);

const selectCategory = (value: string) => {
  !selectedCategories.includes(value)
    ? setSelectedCategories([...selectedCategories, value])
    : setSelectedCategories(without(selectedCategories, value));
};
  return (
    <Form layout={'vertical'} className="new-report-form">
      <Form.Item label="Report Name">
        <Input placeholder="type name here" />
      </Form.Item>
      <Form.Item label="Report Description">
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
      <Form.Item>
        <Button type="primary" size="large">
          Save
        </Button>
      </Form.Item>
      <Form.Item>
        <Button
          style={{ marginRight: '10px' }}
          type="default"
          aria-label="Cancel"
          onClick={() =>
            dispatch({
              type: ActionType.INITIALIZE,
              payload: {
                scale: imagePreviewScale,
                analysisReportId: analysisReportId ? [analysisReportId] : [],
              },
            })
          }
        >
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NewReportForm;

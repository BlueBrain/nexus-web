import * as React from 'react';
import { Form, Input, Button, Spin, Row, Col } from 'antd';

import { isEmptyInput } from '../utils';

import './LinkCodeForm.less';

const { Item } = Form;

export type CodeResourceData = {
  name: string;
  description: string;
  codeSampleType: string;
  programmingLanguage: string;
  runtimePlatform: string;
  url: string;
};

const LinkCodeForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: CodeResourceData): void;
}> = ({ onClickCancel, onSubmit }) => {
  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>('');
  const [descriptionError, setDescriptionError] = React.useState<boolean>(
    false
  );
  const [codeRepository, setCodeRepository] = React.useState<string>('');
  const [codeRepoError, setCodeRepoError] = React.useState<boolean>(false);
  const [codeSampleType, setCodeSampleType] = React.useState<string>('');
  const [programmingLanguage, setProgrammingLang] = React.useState<string>('');
  const [runtimePlatform, setRuntimePlatform] = React.useState<string>('');

  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 9 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 15 } },
  };

  const columnLayout = {
    xs: 24,
    sm: 24,
    md: 24,
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
    setDescriptionError(false);
  };

  const onChangeRepoUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCodeRepository(event.target.value);
    setCodeRepoError(false);
  };

  const onClickSubmit = () => {
    if (isValidInput()) {
      onSubmit({
        name,
        description,
        codeSampleType,
        programmingLanguage,
        runtimePlatform,
        url: codeRepository,
      });
    }
  };

  const isValidInput = () => {
    setNameError(isEmptyInput(name));
    setDescriptionError(isEmptyInput(description));
    setCodeRepoError(isEmptyInput(codeRepository));

    return (
      !isEmptyInput(name) &&
      !isEmptyInput(description) &&
      !isEmptyInput(codeRepository)
    );
  };

  return (
    <Form {...formItemLayout} className="link-code-form">
      <h2 className="link-code-form__name">Link Code</h2>
      <Row>
        <Col {...columnLayout}>
          <Spin spinning={false} tip="Please wait...">
            <Item
              label="Name *"
              validateStatus={nameError ? 'error' : ''}
              help={nameError && 'Please enter a name'}
            >
              <Input value={name} onChange={onChangeName} />
            </Item>
            <Item
              label="Description *"
              validateStatus={descriptionError ? 'error' : ''}
              help={descriptionError && 'Please enter a description'}
            >
              <Input.TextArea
                value={description}
                onChange={onChangeDescription}
              />
            </Item>
            <Item
              label="Code Path or URL *"
              validateStatus={codeRepoError ? 'error' : ''}
              help={codeRepoError && 'Please enter a repository Url'}
            >
              <Input value={codeRepository} onChange={onChangeRepoUrl} />
            </Item>
            <Item label="Code Sample Type">
              <Input
                value={codeSampleType}
                onChange={event => setCodeSampleType(event.target.value)}
              />
            </Item>
            <Item label="Programming Language">
              <Input
                value={programmingLanguage}
                onChange={event => setProgrammingLang(event.target.value)}
              />
            </Item>
            <Item label="Runtime Platform">
              <Input
                value={runtimePlatform}
                onChange={event => setRuntimePlatform(event.target.value)}
              />
            </Item>
            <p>
              <em>* Mandatory fields</em>
            </p>
            <div className="link-code-form__buttons">
              <Button onClick={onClickCancel} style={{ marginRight: '15px' }}>
                Cancel
              </Button>
              <Button onClick={onClickSubmit} type="primary">
                Save
              </Button>
            </div>
          </Spin>
        </Col>
      </Row>
    </Form>
  );
};

export default LinkCodeForm;

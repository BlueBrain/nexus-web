import { withInfo } from '@storybook/addon-info';
import { number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Image } from 'antd';
import AnalysisPlugin, { AnalysisReport } from './AnalysisPlugin';
import { AnalysesAction } from '../../containers/AnalysisPlugin/AnalysisPluginContainer';
// import sample1 from './sample-images/sample1.png';
const sample1 = require('./sample-images/sample1.png');
const sample2 = require('./sample-images/sample2.png');
const sample3 = require('./sample-images/sample3.png');

const baseReportData = {
  name: 'Example analysis report',
  createdAt: '2022-04-01',
  createdBy: '',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
  assets: [
    {
      id: '1',
      name: 'First one',
      filePath: 'https://img/here/1',
      encodingFormat: 'image/png',
      saved: true,
      preview: ({ mode }: { mode: 'view' | 'edit' }) => (
        <>
          <Image preview={mode === 'view'} src={sample1} />
        </>
      ),
    },
    {
      analysisReportId: 'a',
      id: '2',
      name: 'Second one',
      filePath: 'https://img/here/2',
      encodingFormat: 'image/png',
      saved: true,
      preview: ({ mode }: { mode: 'view' | 'edit' }) => (
        <Image src={sample2} preview={mode === 'view'} />
      ),
    },
    {
      analysisReportId: 'a',
      id: '3',
      name: 'Third one',
      filePath: 'https://img/here/3',
      encodingFormat: 'image/png',
      saved: true,
      preview: ({ mode }: { mode: 'view' | 'edit' }) => (
        <Image src={sample3} preview={mode === 'view'} />
      ),
    },
  ],
};

const exampleDataStructure: AnalysisReport[] = [
  {
    ...baseReportData,
    id: 'report1',
    assets: baseReportData.assets.map(a => ({
      ...a,
      analysisReportId: 'report1',
    })),
  },
];

storiesOf('Components/AnalysisPlugin', module)
  .addDecorator(withKnobs)
  .add(
    'View mode',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return (
        <AnalysisPlugin
          FileUpload={() => <></>}
          analysisReports={exampleDataStructure}
          onSave={(name: string, id?: string) => {}}
          onCancel={() => {}}
          onClickRelatedResource={() => {}}
          analysisResourceType={'report_container'}
          imagePreviewScale={number('imagePreviewScale', 50)}
          mode={'view'}
          dispatch={(action: AnalysesAction) => {}}
          selectedAnalysisReports={['report1']}
        />
      );
    })
  )
  .add(
    'Edit mode',
    withInfo(`
      Analysis Plugin in Edit mode

    ~~~js
    ~~~
  `)(() => {
      return (
        <AnalysisPlugin
          FileUpload={() => <></>}
          analysisReports={exampleDataStructure}
          onSave={(name: string, id?: string) => {}}
          onCancel={() => {}}
          onClickRelatedResource={() => {}}
          analysisResourceType={'report_container'}
          imagePreviewScale={number('imagePreviewScale', 50)}
          mode={'edit'}
          dispatch={(action: AnalysesAction) => {}}
          selectedAnalysisReports={['report1']}
          currentlyBeingEditedAnalysisReportId="report1"
        />
      );
    })
  )
  .add(
    'Create mode',
    withInfo(`
      Analysis Plugin in Create mode

    ~~~js
    ~~~
  `)(() => {
      return (
        <AnalysisPlugin
          FileUpload={() => <></>}
          analysisReports={[
            {
              name: '',
              description: '',
              createdBy: '',
              createdAt: '',
              assets: [],
            },
          ]}
          onSave={(name: string, id?: string) => {}}
          onCancel={() => {}}
          onClickRelatedResource={() => {}}
          analysisResourceType={'report_container'}
          imagePreviewScale={number('imagePreviewScale', 50)}
          mode={'create'}
          dispatch={(action: AnalysesAction) => {}}
          currentlyBeingEditingAnalysisReportName=""
          currentlyBeingEditedAnalysisReportDescription=""
        />
      );
    })
  );

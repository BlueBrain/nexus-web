import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Image } from 'antd';
import AnalysisPlugin, { AnalysisReport } from './AnalysisPlugin';
// import sample1 from './sample-images/sample1.png';
const sample1 = require('./sample-images/sample1.png');
const sample2 = require('./sample-images/sample2.png');
const sample3 = require('./sample-images/sample3.png');

const exampleDataStructure: AnalysisReport[] = [
  {
    id: 'analysis1',
    name: 'M-Type Factsheet L1_HAC',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/1',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis2',
    name: 'Cell Density by m-type O1.v6-RC3',
    description: 'This analyses is about...',
    assets: [
      {
        analysisReportId: 'a',
        id: '3',
        name: 'First one',
        filePath: 'https://img/here/1',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
          <Image src={sample3} preview={mode === 'view'} />
        ),
      },
      {
        analysisReportId: 'a',
        id: '4',
        name: 'Second one',
        filePath: 'https://img/here/2',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
          <Image src={sample1} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis3',
    name: 'Neuron Density C-type 01.v3-SSCX4',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/3',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ scale, mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis3',
    name: 'Neuron Density C-type 01.v3-SSCX4',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/3',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis4',
    name: 'Neuron Density C-type 01.v3-SSCX4',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/3',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis5',
    name: 'Neuron Density C-type 01.v3-SSCX4',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/3',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ scale, mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
  {
    id: 'analysis5',
    name: 'Neuron Density C-type 01.v3-SSCX4',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula at felis at lacinia. Suspendisse bibendum nunc non pulvinar ultrices. Mauris sed dolor suscipit, posuere justo quis, dapibus lorem. Aliquam erat volutpat. Suspendisse pulvinar mollis lacus, eget tristique felis elementum in. ',
    assets: [
      {
        analysisReportId: 'a',
        id: '1',
        name: 'First one',
        filePath: 'https://img/here/3',
        encodingFormat: 'image/png',
        saved: true,
        preview: ({ mode }) => (
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
        preview: ({ mode }) => (
          <Image src={sample2} preview={mode === 'view'} />
        ),
      },
    ],
  },
];

storiesOf('Components/AnalysisPlugin', module)
  .addDecorator(withKnobs)
  .add(
    'AnalysisPlugin',
    withInfo(`

    ~~~js
    ~~~
  `)(() => {
      return (
        <AnalysisPlugin
          FileUpload={() => <></>}
          analysisReports={exampleDataStructure}
          onSave={(id: string, name: string) => {}}
          onCancel={() => {}}
        />
      );
    })
  );

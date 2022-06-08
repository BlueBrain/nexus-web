import * as React from 'react';
import AnalysisPlugin, {
  analyses,
} from '../../components/AnalysisPlugin/AnalysisPlugin';

const exampleDataStructure: analyses = [
  {
    name: 'First analysis',
    description: 'This analyses is about...',
    analyses: [
      { name: 'First one', filePath: 'https://img/here/1' },
      { name: 'Second one', filePath: 'https://img/here/2' },
    ],
  },
  {
    name: 'Second analysis',
    description: 'This analyses is about...',
    analyses: [
      { name: 'First one', filePath: 'https://img/here/1' },
      { name: 'Second one', filePath: 'https://img/here/2' },
    ],
  },
];

export default () => {
  return (
    <AnalysisPlugin
      analyses={exampleDataStructure}
      mode="view"
      onCancel={() => {}}
      onChangeMode={(mode: 'view' | 'edit') => {}}
      onSave={(analyses: analyses) => {}}
    />
  );
};

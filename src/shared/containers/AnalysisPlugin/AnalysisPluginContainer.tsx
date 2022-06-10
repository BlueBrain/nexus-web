import * as React from 'react';
import { useState } from 'react';
import AnalysisPlugin, {
  analyses,
} from '../../components/AnalysisPlugin/AnalysisPlugin';

// const exampleDataStructure: analyses = [
//   {
//     name: 'First analysis',
//     description: 'This analyses is about...',
//     analyses: [
//       { name: 'First one', filePath: 'https://img/here/1', preview: () => <img src="" /> },
//       { name: 'Second one', filePath: 'https://img/here/2' },
//     ],
//   },
//   {
//     name: 'Second analysis',
//     description: 'This analyses is about...',
//     analyses: [
//       { name: 'First one', filePath: 'https://img/here/1' },
//       { name: 'Second one', filePath: 'https://img/here/2' },
//     ],
//   },
// ];

export default () => {
  const analyses: analyses = [];

  const [mode, setMode] = useState('view');

  return (
    <AnalysisPlugin
      analyses={analyses}
      mode="view"
      onCancel={() => {}}
      onChangeMode={(mode: 'view' | 'edit') => {
        setMode(mode);
      }}
      onSave={(analyses: analyses) => {}}
    />
  );
};

import * as React from 'react';

export type analyses = {
  name: string;
  description: string;
  analyses: {
    name: string;
    filePath: string; // expect this is an image for now
  }[];
}[];

type AnalysisPluginProps = {
  analyses: analyses;
  mode: 'view' | 'edit';
  onSave: (analyses: analyses) => void;
  onCancel: () => void;
  onChangeMode: (mode: 'view' | 'edit') => void;
};

export default ({ analyses, mode }: AnalysisPluginProps) => {
  return (
    <>
      {mode === 'view' && (
        <>
          {analyses.map((a, i) => (
            <section key={i}>
              <h1 aria-label="Analysis Name">{a.name}</h1>
              <p aria-label="Analysis Description">{a.description}</p>
            </section>
          ))}
        </>
      )}
      {mode === 'edit' && <>EDITING</>}
    </>
  );
};

import '@testing-library/jest-dom';

import { resourceResolverApi } from '__mocks__/handlers/ResourceEditor/handlers';
import codemiror from 'codemirror';
import * as React from 'react';
import { vi } from 'vitest';

import { render, waitFor } from '../../../utils/testUtil';
import CodeEditor from './CodeEditor';
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = vi.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn(),
    };
  };

  return range;
};

describe('ResourceEditor', () => {
  it('check if code editor will be rendered in the screen', async () => {
    const editor = React.createRef<codemiror.Editor>();
    const { queryByText, container } = render(
      <CodeEditor
        data-testid="code-mirror-editor"
        value={JSON.stringify(resourceResolverApi)}
        editable={false}
        busy={false}
        keyFoldCode={() => {}}
        handleChange={() => {}}
        ref={editor}
        fullscreen={false}
      />
    );
    await waitFor(async () => {
      const codemirrorCode = container.querySelector('.CodeMirror-code');
      expect(codemirrorCode).toBeInTheDocument();
      const d = queryByText(/NeuronMorphology/);
      expect(d).toBeInTheDocument();
    });
  });
});

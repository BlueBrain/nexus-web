import '@testing-library/jest-dom';
import * as React from 'react';
import { render, waitFor } from '../../../utils/testUtil';
import { resourceResolverApi } from '__mocks__/handlers/ResourceEditor/handlers';
import CodeEditor from './CodeEditor';

import codemiror from 'codemirror';
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    };
  };

  return range;
};
describe('ResourceEditor', () => {
  it('check if code editor will be rendered in the screen', async () => {
    const editor = React.createRef<codemiror.Editor>();
    const onLinksFound = jest.fn();
    const { queryByText, container, getByTestId } = render(
      <CodeEditor
        data-testId="code-mirror-editor"
        value={JSON.stringify(resourceResolverApi)}
        editable={false}
        onLinkClick={() => {}}
        onLinksFound={onLinksFound}
        busy={false}
        keyFoldCode={() => {}}
        handleChange={() => {}}
        loadingResolution={false}
        ref={editor}
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

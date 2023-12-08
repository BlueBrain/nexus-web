import '@testing-library/jest-dom';

import { Button, Tooltip } from 'antd';
import { vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../utils/testUtil';
import * as CopyUtils from '../../utils/copy';
import Copy from '.';

Object.defineProperty(document, 'queryCommandSupported', {
  writable: true,
  value: vi.fn().mockImplementation((query) => true),
});

Object.defineProperty(document, 'execCommand', {
  writable: true,
  value: vi.fn().mockImplementation((query) => true),
});

describe('CopyComponent', () => {
  beforeEach(() => {
    render(
      <Copy
        data-testid="copy-comp"
        render={(copySuccess, triggerCopy) => (
          <Tooltip
            data-testid="copy-status"
            title={copySuccess ? 'Copied!' : 'Copy Environment Information'}
          >
            <Button
              data-testid="copy-btn"
              aria-label="copy-text"
              onClick={() => triggerCopy(MOCK_TEXT_TO_COPY)}
              type="text"
              size="small"
              className="copy-icon"
            >
              Copy
            </Button>
          </Tooltip>
        )}
      />
    );
  });

  it('renders child component(s)', async () => {
    const copyBtn = await screen.getByRole('button');
    expect(copyBtn).toHaveTextContent('Copy');
  });

  it('triggers copy of text', async () => {
    const triggerCopySpy = vi.spyOn(CopyUtils, 'triggerCopy');
    const copyBtn = await screen.getByRole('button');

    await act(async () => {
      await fireEvent.click(copyBtn);
    });

    expect(triggerCopySpy).toHaveBeenCalledWith(MOCK_TEXT_TO_COPY);
  });
});

const MOCK_TEXT_TO_COPY = `
    A
    Multiline
    String
    🦄
`;

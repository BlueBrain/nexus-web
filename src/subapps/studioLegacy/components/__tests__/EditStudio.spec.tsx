import '@testing-library/jest-dom';

import { Context } from '@bbp/nexus-sdk';
import * as React from 'react';
import { vi } from 'vitest';

import { render, screen } from '../../../../utils/testUtil';
import EditStudio, { StudioResource } from '../EditStudio';

describe('EditStudio', () => {
  it('Renders EditStduio', () => {
    const context = {
      id: 'context-id',
    } as Context;
    const mockStudioResource = ({
      '@context': context,
      label: 'a label',
    } as unknown) as StudioResource;

    render(
      <EditStudio
        studio={mockStudioResource}
        onSave={vi.fn()}
        onSaveImage={vi.fn()}
        markdownViewer={vi.fn()}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeVisible();
  });
});

import '@testing-library/jest-dom';

import { Context } from '@bbp/nexus-sdk';
import { vi } from 'vitest';

import { fireEvent, render, screen,waitFor } from '../../../../utils/testUtil';
import WorkspaceEditorForm, { WorkspaceResource } from '../WorkspaceEditorForm';

describe('WorkspaceEditorForm', () => {
  const context = {
    id: 'context-id',
  } as Context;
  const mockStudioResource = ({
    '@context': context,
    label: 'a label',
  } as unknown) as WorkspaceResource;
  it('Renders WorkspaceEditorForm and allows submission', async () => {
    const saveWorkspace = vi.fn();
    render(
      <WorkspaceEditorForm
        saveWorkspace={saveWorkspace}
        workspace={mockStudioResource}
      ></WorkspaceEditorForm>
    );

    const form = await screen.findByRole('button');

    await waitFor(async () => {
      await fireEvent.click(form);
    });
    expect(saveWorkspace).toHaveBeenCalled();
  });
});

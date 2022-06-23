import WorkspaceEditorForm, { WorkspaceResource } from '../WorkspaceEditorForm';
import { Context } from '@bbp/nexus-sdk';
import { render, fireEvent, waitFor, screen } from '../../../../utils/testUtil';
import '@testing-library/jest-dom';

describe('WorkspaceEditorForm', () => {
  const context = {
    id: 'context-id',
  } as Context;
  const mockStudioResource = ({
    '@context': context,
    label: 'a label',
  } as unknown) as WorkspaceResource;
  it('Renders WorkspaceEditorForm and allows submission', async () => {
    const saveWorkspace = jest.fn();
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

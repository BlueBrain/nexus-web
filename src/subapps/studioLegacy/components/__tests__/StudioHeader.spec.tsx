import { vi } from 'vitest';
import StudioHeader from '../StudioHeader';
import { Resource, Context } from '@bbp/nexus-sdk';
import { render, screen } from '../../../../utils/testUtil';
import '@testing-library/jest-dom';

describe('StudioHeader', () => {
  const context = {
    id: 'context-id',
  } as Context;
  const mockStudioResource = ({
    '@context': context,
    label: 'a label',
  } as unknown) as Resource;
  it('Renders StudioHeader with a title', () => {
    render(
      <StudioHeader resource={mockStudioResource} markdownViewer={vi.fn()} />
    );
    const title = screen.getByRole('heading');
    expect(title).toHaveTextContent('a label');
  });

  it('Renders StudioHeader with a markdownViewer when there is a  description', () => {
    const markdownviewer = () => {
      return <div data-testid="test-id"></div>;
    };
    const mockStudioResource = ({
      '@context': context,
      label: 'a label',
      description: 'a description',
    } as unknown) as Resource;
    render(
      <StudioHeader
        resource={mockStudioResource}
        markdownViewer={markdownviewer}
      />
    );
    const viewer = screen.getByTestId('test-id');
    expect(viewer).toBeVisible();
  });
});

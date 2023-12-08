import '@testing-library/jest-dom';

import { vi } from 'vitest';

import { fireEvent, render, screen } from '../../../../utils/testUtil';
import StudioList from '../StudioList';
describe('StudioList', () => {
  const studios = [
    {
      id: 'id-1',
      name: 'test Studio',
      description: 'My description',
    },
    {
      id: 'id-2',
      name: 'another studio',
      description: 'another description',
    },
  ];

  it('renders studios in a list', async () => {
    render(<StudioList studios={studios} makeResourceUri={vi.fn()} />);
    const studioItems = await screen.findAllByRole('listitem');

    expect(studioItems.length).toBe(2);
  });

  it('renders studios in a list with correct text and  description)', async () => {
    render(<StudioList studios={studios} makeResourceUri={vi.fn()} />);
    const studioItems = await screen.findAllByRole('listitem');
    expect(studioItems[0]).toHaveTextContent('test Studio');
    expect(studioItems[0]).toHaveTextContent('My description');
    expect(studioItems[1]).toHaveTextContent('another studio');
    expect(studioItems[1]).toHaveTextContent('another description');
  });

  it('calls makeResourceUri on clicking on the list item link', async () => {
    const makeResourceUri = vi.fn();
    render(<StudioList studios={studios} makeResourceUri={makeResourceUri} />);
    const listItemLink = await screen.getAllByRole('link');
    await fireEvent.click(listItemLink[0]);
    expect(makeResourceUri).toHaveBeenCalled();
  });
});

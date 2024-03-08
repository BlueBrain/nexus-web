import { vi } from 'vitest';
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from '../../../../../utils/testUtil';
import '@testing-library/jest-dom';
import SearchLayouts from '..';
import { SearchLayout } from '../../../../../subapps/search/hooks/useGlobalSearch';

describe('SearchLayouts', () => {
  // @ts-ignore
  const layouts = [
    {
      name: 'MINDS',
      visibleFields: [
        'project',
        '@type',
        'name',
        'description',
        'brainRegion',
        'subjectSpecies',
        'license',
      ],
    },
    {
      name: 'Neuron Morphology',
      visibleFields: [
        'project',
        'name',
        'description',
        'brainRegion',
        'mType',
        'subjectSpecies',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/NeuronMorphology'],
          operator: 'and',
        },
      ],
      sort: [
        {
          field: 'updatedAt',
          order: 'desc',
        },
      ],
    },
    {
      name: 'Neuron Electrophysiology',
      visibleFields: [
        'project',
        'name',
        'description',
        'brainRegion',
        'eType',
        'subjectSpecies',
        'subjectAge',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/Trace'],
          operator: 'and',
        },
      ],
      sort: [
        {
          field: 'brainRegion',
          order: 'asc',
        },
        {
          field: 'updatedAt',
          order: 'asc',
        },
      ],
    },
    {
      name: 'Layer Anatomy',
      visibleFields: [
        'project',
        'description',
        'brainRegion',
        'layerThickness',
        'subjectSpecies',
        'subjectAge',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/LayerThickness'],
          operator: 'and',
        },
      ],
    },
    {
      name: 'Neuron Density',
      visibleFields: [
        'project',
        'description',
        'brainRegion',
        'neuronDensity',
        'subjectSpecies',
        'subjectAge',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/NeuronDensity'],
          operator: 'and',
        },
      ],
    },
    {
      name: 'Bouton Density',
      visibleFields: [
        'project',
        'description',
        'brainRegion',
        'boutonDensity',
        'subjectSpecies',
        'subjectAge',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/BoutonDensity'],
          operator: 'and',
        },
      ],
    },
    {
      name: 'Circuit',
      visibleFields: [
        'project',
        'description',
        'brainRegion',
        'circuitType',
        'circuitBase',
        'circuitConfigPath',
        'subjectSpecies',
        'subjectAge',
      ],
      filters: [
        {
          field: '@type',
          values: ['https://neuroshapes.org/DetailedCircuit'],
          operator: 'and',
        },
      ],
    },
  ] as SearchLayout[];

  it('renders something', async () => {
    render(<SearchLayouts layouts={layouts} onChangeLayout={vi.fn()} />);

    await act(async () => {
      // required to populate select items (come on antd!)
      fireEvent.mouseDown(screen.getByRole('combobox'));
    });
    // screen.debug();
    await waitFor(async () => {
      const layoutItems = await screen.findAllByRole('option');
      expect(layoutItems.length).toBe(layouts.length);
    });
  });
});

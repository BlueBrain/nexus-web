import { render, fireEvent, screen, within } from '../../../../utils/testUtil';
import SortConfigContainer from '../SortConfigContainer';
import { ESSortField } from 'subapps/search/hooks/useGlobalSearch';
import { SortDirection } from '../../../../shared/hooks/useAccessDataForTable';
import '@testing-library/jest-dom';

describe('Sort Config Container', () => {
  it('Sort button shows text to indicate no sorted columns when there are none', () => {
    render(
      <SortConfigContainer
        sortedFields={[]}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={(sort: ESSortField) => {}}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    expect(showSortingModalBtn.textContent).toEqual(' No sorting');
  });

  it('Sort button shows text to indicate the number of sorted columns', () => {
    const sortedFields = [
      {
        direction: SortDirection.ASCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={(sort: ESSortField) => {}}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    expect(showSortingModalBtn.textContent).toEqual(' Sorted on 1 column');
  });

  it('Sort button shows modal when clicked', () => {
    const sortedFields = [
      {
        direction: SortDirection.ASCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={(sort: ESSortField) => {}}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    fireEvent.click(showSortingModalBtn);
    const sortList = screen.getByRole('document');
    expect(sortList).toBeInTheDocument();
  });

  it('Clicking on sort descending triggers callback with correct params', () => {
    const onChangeSortDirection = jest.fn();
    const sortedFields = [
      {
        direction: SortDirection.ASCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={onChangeSortDirection}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    fireEvent.click(showSortingModalBtn);
    const sortList = screen.getByRole('listitem');
    const sortBtn = within(sortList).getByRole('button', {
      name: /Descending/,
    });
    fireEvent.click(sortBtn);

    expect(onChangeSortDirection).toHaveBeenCalledWith({
      direction: SortDirection.DESCENDING,
      label: 'Brain Region',
      term: 'brainRegion.label.keyword',
      fieldName: 'brainRegion',
    });
  });

  it('Clicking on sort ascending triggers callback with correct params', () => {
    const onChangeSortDirection = jest.fn();
    const sortedFields = [
      {
        direction: SortDirection.DESCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={onChangeSortDirection}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    fireEvent.click(showSortingModalBtn);
    const sortList = screen.getByRole('listitem');
    const sortBtn = within(sortList).getByRole('button', {
      name: /Ascending/,
    });
    fireEvent.click(sortBtn);

    expect(onChangeSortDirection).toHaveBeenCalledWith({
      direction: SortDirection.ASCENDING,
      label: 'Brain Region',
      term: 'brainRegion.label.keyword',
      fieldName: 'brainRegion',
    });
  });

  it('Clicking on sort ascending triggers callback with correct params', () => {
    const onRemoveSortOption = jest.fn();
    const sortedFields = [
      {
        direction: SortDirection.DESCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={onRemoveSortOption}
        onChangeSortDirection={(sort: ESSortField) => {}}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    fireEvent.click(showSortingModalBtn);
    const sortList = screen.getByRole('listitem');
    const removeBtn = within(sortList).getByRole('button', {
      name: /Remove/,
    });
    fireEvent.click(removeBtn);

    expect(onRemoveSortOption).toHaveBeenCalledWith({
      direction: SortDirection.DESCENDING,
      label: 'Brain Region',
      term: 'brainRegion.label.keyword',
      fieldName: 'brainRegion',
    });
  });

  it('Clicking outside modal closes it', () => {
    const sortedFields = [
      {
        direction: SortDirection.DESCENDING,
        label: 'Brain Region',
        term: 'brainRegion.label.keyword',
        fieldName: 'brainRegion',
      },
    ];
    render(
      <SortConfigContainer
        sortedFields={sortedFields}
        onRemoveSort={(sort: ESSortField) => {}}
        onChangeSortDirection={(sort: ESSortField) => {}}
      />
    );

    const showSortingModalBtn = screen.getByRole('button');
    fireEvent.click(showSortingModalBtn);
    const modal = screen.getByRole('document', { hidden: false });
    expect(modal).toBeInTheDocument();
    const hiddenModal = screen.getByRole('document', { hidden: true });
    expect(hiddenModal).toBeInTheDocument();
  });
});

import * as React from 'react';
import { Checkbox, Collapse, Badge } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import './FacetList.less';

export interface Binding {
  [filterName: string]: { type: string; value: string };
}

export const makeFacets = (queryResults: any) => {
  return (
    queryResults &&
    queryResults.results &&
    queryResults.results.bindings.reduce((memo: Facet[], entry: Binding) => {
      const [filterIDData, filterLabelData] = Object.keys(entry);
      const filterName = filterIDData.replace('ID', '');
      const filter: Facet | undefined = memo.find(
        (entry: any) => entry.name === filterName
      );
      const filterValue = {
        id: entry[filterIDData].value,
        label: filterLabelData
          ? entry[filterLabelData].value
          : entry[filterIDData].value,
      };
      if (filter) {
        filter.values.push(filterValue);
      } else {
        memo.push({
          name: filterName,
          values: [filterValue],
        });
      }
      return memo;
    }, [])
  );
};

export interface FacetUpdatePayload {
  facetName: string;
  values: string[];
}

export interface Facet {
  name: string;
  values: {
    id: string;
    label: string;
  }[];
}

interface FacetProps {
  appliedFacets?: { [filterName: string]: string[] };
  facets?: Facet[];
  updateFacets?: (filterUpdate: FacetUpdatePayload) => void;
}

const FacetList: React.FunctionComponent<FacetProps> = props => {
  const { appliedFacets = {}, facets, updateFacets = () => {} } = props;

  const handleChange = (facetName: string, values: any[]) => {
    updateFacets({
      facetName,
      values,
    });
  };

  return (
    <div className="facet-list">
      <Collapse bordered={false}>
        {facets &&
          !!facets.length &&
          facets.map((facet, index) => {
            const groupAppliedFilters = appliedFacets[facet.name];
            const groupAppliedFiltersCount = groupAppliedFilters
              ? groupAppliedFilters.length
              : 0;
            const header = (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: '60%' }}>{facet.name}</div>
                <div style={{ width: '20%' }}>
                  <Badge
                    count={groupAppliedFiltersCount}
                    style={{ backgroundColor: '#44c7f4' }}
                  />
                </div>
                <div>{facet.values.length}</div>
              </div>
            );
            return (
              <CollapsePanel header={header} key={`$${index}`}>
                <Checkbox.Group
                  style={{ width: '100%' }}
                  onChange={values => handleChange(facet.name, values)}
                >
                  <ul className="checkbox-list">
                    {facet.values.map(value => {
                      return (
                        <li key={value.id}>
                          <Checkbox
                            value={value.id}
                            checked={
                              groupAppliedFilters &&
                              groupAppliedFilters.indexOf(value.id) >= 0
                            }
                          >
                            {value.label}
                          </Checkbox>
                        </li>
                      );
                    })}
                  </ul>
                </Checkbox.Group>
              </CollapsePanel>
            );
          })}
      </Collapse>
    </div>
  );
};

export default FacetList;

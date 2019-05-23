import { makeESQuery } from '../makeESQuery';

describe('makeESQuery', () => {
  it('should return an empty object if no query prop is provided', () => {
    expect(makeESQuery()).toEqual({});
  });

  describe('text query', () => {
    it('should return a must clause with a query string', () => {
      expect(
        makeESQuery({
          filters: {
            _deprecated: false,
            showManagementResources: false,
          },
          textQuery: 'banana',
        })
      ).toMatchSnapshot();
    });
  });

  describe('deprecated', () => {
    it('should return a must clause with just the term query', () => {
      expect(
        makeESQuery({
          filters: {
            _deprecated: false,
            showManagementResources: false,
          },
        })
      ).toMatchSnapshot();
    });
  });

  describe('_constrainedBy', () => {
    it('should return a must clause with a term query for both _deprecated and _constrainedBy', () => {
      expect(
        makeESQuery({
          filters: {
            _constrainedBy: 'mySchema',
            _deprecated: false,
            showManagementResources: false,
          },
        })
      ).toMatchSnapshot();
    });
  });

  describe('@type', () => {
    it('should return a must clause with a term query for both _deprecated and @types', () => {
      expect(
        makeESQuery({
          filters: {
            '@type': 'myType',
            _deprecated: true,
            showManagementResources: false,
          },
        })
      ).toMatchSnapshot();
    });
  });

  describe('everything at once', () => {
    it('should return a must clause with the kitchen sink', () => {
      expect(
        makeESQuery({
          filters: {
            '@type': 'myType',
            _constrainedBy: 'mySchemas',
            _deprecated: true,
            showManagementResources: false,
          },
          textQuery: 'Banana',
        })
      ).toMatchSnapshot();
    });
  });
});

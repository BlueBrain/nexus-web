import { sortStringsBySimilarity } from '../stringSimilarity';

describe('sortStringsBySimilarity', () => {
  it('sorts an array of strings based on similarity', () => {
    const valuesToSort = [
      'one',
      'two',
      'three',
      'two-one',
      'one-two',
      'twotest',
    ];

    expect(sortStringsBySimilarity('twotest', valuesToSort)[0]).toEqual(
      'twotest'
    );
    expect(sortStringsBySimilarity('three', valuesToSort)[0]).toEqual('three');
    expect(sortStringsBySimilarity('one', valuesToSort)[0]).toEqual('one');
  });
});

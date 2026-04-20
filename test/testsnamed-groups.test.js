const RegXpChef = require('../src/RegXpChef');

describe('named capture group utilities', () => {

  test('groupCounts counts duplicate named groups that are mutually exclusive', () => {
    // 1. Sample text
    const sample = 'a b';

    // 2. Reference result
    const expectedCounts = { x: 2 };

    // 3. Reference regex
    // Duplicate group name "x", but only one can match per alternation
    const reference = /(?<x>a)|(?<x>b)/g;

    // 4. Verify reference regex (sanity check)
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== 2) {
      throw new Error('Test setup error: reference regex does not work as expected');
    }
    expect(referenceMatches).toEqual(['a', 'b']);

    // 5. groupCounts invocation
    const counts = RegXpChef.groupCounts(reference);

    // 6. Syntax verification (structural expectation)
    // groupCounts operates purely on source inspection
    expect(counts).toEqual(expectedCounts);
  });

  test('groupCounts ignores unnamed groups', () => {
    // 1. Sample text
    const sample = 'ab';

    // 2. Reference result
    const expectedCounts = { x: 1 };

    // 3. Reference regex
    const reference = /(a)(?<x>b)/;

    // 4. Verify reference regex
    expect(reference.test(sample)).toBe(true);

    // 5. groupCounts invocation
    const counts = RegXpChef.groupCounts(reference);

    // 6. Syntax verification
    expect(counts).toEqual(expectedCounts);
  });

  test('matchGroups returns only defined groups for a given match', () => {
    // 1. Sample text
    const sample = 'b';

    // 2. Reference result
    const expectedGroups = ['y'];

    // 3. Reference regex
    // Only one named group can be defined per match
    const reference = /(?<x>a)|(?<y>b)/;

    // 4. Verify reference regex
    const match = sample.match(reference);
    if (!match || !match.groups) {
      throw new Error('Test setup error: reference regex does not work as expected');
    }

    // 5. matchGroups invocation
    const groups = RegXpChef.matchGroups(match);

    // 6. Behavioral verification
    expect(groups).toEqual(expectedGroups);
  });

  test('matchGroups returns undefined when no named groups are present', () => {
    // 1. Sample text
    const sample = 'a';

    // 2. Reference result
    const expected = undefined;

    // 3. Reference regex
    const reference = /(a)/;

    // 4. Verify reference regex
    const match = sample.match(reference);
    expect(match).not.toBeNull();

    // 5. matchGroups invocation
    const groups = RegXpChef.matchGroups(match);

    // 6. Behavioral verification
    expect(groups).toBe(expected);
  });

});

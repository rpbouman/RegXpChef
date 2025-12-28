const RegXpChef = require('../src/RegXpChef');

describe('regexp arguments and local flag handling', () => {

  test('regexp with identical flags does not produce local flag group', () => {
    // 1. Sample text
    const sample = 'A a';

    // 2. Reference result
    const expectedMatches = ['A', 'a'];

    // 3. Reference regex
    const reference = /a/gi;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'gi',
      $content: /a/i
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toBe('a');

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('regexp with additional flags produces local flag group', () => {
    // 1. Sample text
    const sample = 'a\nA';

    // 2. Reference result
    const expectedMatches = ['a', 'A'];

    // 3. Reference regex
    const reference = /(?i:a)/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: /a/i
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/\(\?i:/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

});

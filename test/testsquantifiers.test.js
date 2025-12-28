const RegXpChef = require('../src/RegXpChef');

describe('quantifier handling via $min and $max', () => {

  test('bounded repetition', () => {
    // 1. Sample text
    const sample = 'a aa aaa aaaa';

    // 2. Reference result
    const expectedMatches = ['aa', 'aaa', 'aaa'];

    // 3. Reference regex
    const reference = /a{2,3}/g;

    // 4. Verify reference regex
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: 'a',
      $min: 2,
      $max: 3
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/\{2,3\}/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('canonical quantifier reduction: {1} becomes empty', () => {
    // 1. Sample text
    const sample = 'a';

    // 2. Reference result
    const expectedMatches = ['a'];

    // 3. Reference regex
    const reference = /a/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: 'a',
      $min: 1,
      $max: 1
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toBe('a');

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('invalid quantifier configuration throws', () => {
    // 1. Sample text
    const sample = 'aaa';

    // 2. Reference result
    const expectedMatches = [];

    // 3. Reference regex
    const reference = /a/g;
    expect(sample.match(reference)).toEqual(['a', 'a', 'a']);

    // 5. RegXpChef configuration (invalid)
    const config = {
      $flags: 'g',
      $content: 'a',
      $min: -1
    };

    // 6–7. Compilation must fail
    expect(() => RegXpChef.compile(config)).toThrow();
  });

});

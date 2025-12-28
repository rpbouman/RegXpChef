const RegXpChef = require('../src/RegXpChef');

describe('global flags and local flag modulation', () => {

  test('no local flag group when regexp flags equal global flags', () => {
    // 1. Sample text
    const sample = 'A a';

    // 2. Reference result
    const expectedMatches = ['A', 'a'];

    // 3. Reference regex
    const reference = /a/gi;
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 4. RegXpChef configuration
    // First argument defines global flags
    const config = /a/gi;

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(config);

    // No local flag group should be emitted
    expect(assembled.source).toBe('a');
    expect(assembled.flags).toBe('gi');

    // 6. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('local flag is added when regexp has extra allowed flag', () => {
    // 1. Sample text
    const sample = 'a\nb';

    // 2. Reference result
    const expectedMatches = ['a\nb'];

    // 3. Reference regex
    const reference = /a.b/s;
    expect(reference.test(sample)).toBe(true);

    // 4. RegXpChef configuration
    // Global flags: none
    // Local flags: s
    const config = [/a.b/s];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(config);

    // Must emit local dotAll flag
    expect(assembled.source).toMatch(/\(\?s:a\.b\)/);
    expect(assembled.flags).toBe('');

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(regex.test(sample)).toBe(true);
  });

  test('local flag is removed when regexp lacks global allowed flag', () => {
    // 1. Sample text
    const sample = 'A a';

    // 2. Reference result
    const expectedMatches = ['a'];

    // 3. Reference regex
    const reference = /a/;
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 4. RegXpChef configuration
    // Global flags include i
    // Local regexp does not
    const config = [
      { $flags: 'gi' },
      /a/
    ];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(...config);

    // Must explicitly remove local case-insensitive flag
    expect(assembled.source).toMatch(/\(\?-i:a\)/);
    expect(assembled.flags).toBe('gi');

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('unsupported local flags are ignored', () => {
    // 1. Sample text
    const sample = 'a a';

    // 2. Reference result
    const expectedMatches = ['a', 'a'];

    // 3. Reference regex
    const reference = /a/g;
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 4. RegXpChef configuration
    // "g" is not an allowed local flag
    const config = [/a/g];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(...config);

    // No local flag group should be emitted
    expect(assembled.source).toBe('a');

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

});

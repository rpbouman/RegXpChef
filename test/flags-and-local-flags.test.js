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

  test('local flags can be added and removed simultaneously', () => {
    // 1. Sample text
    const sample = 'A\nb';

    // 2. Reference result
    const expectedMatches = ['A\nb'];

    // 3. Reference regex
    // Case-insensitive + dotAll
    const reference = /a.b/is;
    expect(reference.test(sample)).toBe(true);

    // 4. RegXpChef configuration
    // Global flags: i
    // Local regexp: s (adds s, keeps i)
    const config = [
      { $flags: 'i' },
      /a.b/si
    ];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(...config);

    // Must add s without removing i
    expect(assembled.source).toMatch(/\(\?s:a\.b\)/);
    expect(assembled.flags).toBe('i');

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(regex.test(sample)).toBe(true);
  });
  
  test('local flags do not affect subsequent pattern fragments', () => {
    // 1. Sample text
    const sample = 'A\nb';

    // 2. Reference result
    const expectedMatches = ['A\nb'];

    // 3. Reference regex
    // First part uses dotAll, second does not
    const reference = /(?s:a.b)c/i;
    expect(reference.test('A\nbc')).toBe(true);
    expect(reference.test(sample)).toBe(false);

    // 4. RegXpChef configuration
    const config = [
      {$flags:''},
      /a.b/is,  // dotAll locally
      'c'      // must NOT inherit dotAll
    ];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(...config);

    // Local flag group must only wrap first fragment
    expect(assembled.source).toMatch(/^\(\?is:a\.b\)c$/);

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(regex.test('A\nbc')).toBe(true);
    expect(regex.test(sample)).toBe(false);
  });
  
  test('multiple local flag scopes compose independently', () => {
    // 1. Sample text
    const sample = 'A\nb';

    // 2. Reference result
    const expectedMatches = ['A\nb'];

    // 3. Reference regex
    const reference = /(?i:a)(?s:.b)/;
    expect(reference.test(sample)).toBe(true);

    // 4. RegXpChef configuration
    const config = [
    {$flags: ''},
      /a/i,   // local i
      /.b/s   // local s
    ];

    // 5. Syntax verification
    const assembled = RegXpChef.assemble(...config);

    // Each fragment must carry its own flag group
    expect(assembled.source).toMatch(/\(\?i:a\)\(\?s:\.b\)/);

    // 6. Behavioral verification
    const regex = RegXpChef.compile(...config);
    expect(regex.test(sample)).toBe(true);
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

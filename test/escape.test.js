const RegXpChef = require('../src/RegXpChef');

describe('RegXpChef.escape', () => {

  test('escapes all regex metacharacters', () => {
    // Workflow:
    // 1. Sample input that would be unsafe in a regex
    const input = 'a+b*c?d(e)[f]{g}|h^i$\\.';

    // 2. Reference escaped result
    const expected = 'a\\+b\\*c\\?d\\(e\\)\\[f\\]\\{g\\}\\|h\\^i\\$\\\\\\.';

    // 3. Generate escaped output
    const actual = RegXpChef.escape(input);

    // 4. Verify syntax only
    expect(actual).toBe(expected);
  });

  test('non-string input is stringified before escaping', () => {
    const input = 123;
    const expected = '123';

    const actual = RegXpChef.escape(input);

    expect(actual).toBe(expected);
  });

});

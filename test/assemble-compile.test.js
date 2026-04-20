const RegXpChef = require('../src/RegXpChef');

describe('assemble and compile', () => {

  test('assemble concatenates sources without executing regex', () => {
    // Workflow:
    // 1. Sample text
    const sample = 'abc123';

    // 2. Reference regex
    const reference = /abc\d+/;

    // 3. Verify reference regex sanity
    expect(sample.match(reference)[0]).toBe('abc123');

    // 4. RegXpChef configuration
    const assembled = RegXpChef.assemble('abc', /\d+/);

    // 5. Verify generated syntax
    expect(assembled.source).toBe('abc\\d+');
    expect(assembled.flags).toBe('');

    // 6. Behavioral test
    const compiled = new RegExp(assembled.source);
    expect(sample.match(compiled)[0]).toBe('abc123');
  });

  test('compile returns a RegExp instance', () => {
    const regex = RegXpChef.compile('a', 'b', 'c');
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.source).toBe('abc');
  });

});

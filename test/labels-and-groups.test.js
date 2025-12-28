const RegXpChef = require('../src/RegXpChef');

describe('labels and named groups', () => {

  test('object keys become named capture groups', () => {
    // 1. Sample text
    const sample = 'abc123';

    // 2. Reference regex
    const reference = /(?<letters>[a-z]+)|(?<digits>\d+)/g;
    const refMatch = ['abc', '123'];
    expect(sample.match(reference)).toEqual(refMatch);

    // 3. RegXpChef configuration
    const config = {
      letters: /[a-z]+/,
      digits: /\d+/
    };

    // 4. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toContain('(?<letters>');
    expect(assembled.source).toContain('(?<digits>');

    // 5. Behavioral verification
    const regex = RegXpChef.compile({$flags: 'g'}, config);
    expect(sample.match(regex)).toEqual(refMatch);
  });

  test('groupCounts reports named group occurrences', () => {
    const source = '(?<a>x)(?<a>y)(?<b>z)';
    const counts = RegXpChef.groupCounts(source);
    expect(counts).toEqual({ a: 2, b: 1 });
  });

});

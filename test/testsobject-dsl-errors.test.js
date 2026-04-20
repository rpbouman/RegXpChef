const RegXpChef = require('../src/RegXpChef');

describe('invalid object DSL configurations', () => {

  test('mixing $-prefixed and non-$ properties throws', () => {
    // 5. RegXpChef configuration
    const config = {
      foo: 'a',
      $content: 'b'
    };

    // 6–7. Compilation must fail
    expect(() => RegXpChef.compile(config)).toThrow();
  });

  test('$escape without $end throws', () => {
    // 5. RegXpChef configuration
    const config = {
      $content: 'a',
      $escape: '\\'
    };

    // 6–7. Compilation must fail
    expect(() => RegXpChef.compile(config)).toThrow();
  });

  test('$content array combined with $min throws', () => {
    // 5. RegXpChef configuration
    const config = {
      $content: ['a', 'b'],
      $min: 1
    };

    // 6–7. Compilation must fail
    expect(() => RegXpChef.compile(config)).toThrow();
  });

});

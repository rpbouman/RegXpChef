const RegXpChef = require('../src/RegXpChef');

describe('object content and quantifiers', () => {

  test('min/max quantifier - range {2,3}', () => {
    // 1. Sample text
    const sample = 'a aa aaa aaaa aaaaa';

    // 2. Reference result
    const expectedMatches = ['aa', 'aaa', 'aaa', 'aaa', 'aa'];

    // 3. Reference regex
    const reference = /a{2,3}/g;

    // 4. Verify reference (sanity check)
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== expectedMatches.length) {
      throw new Error('Test setup error: reference regex does not work');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $content: 'a',
      $min: 2,
      $max: 3
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should generate {2,3} quantifier
    expect(assembled.source).toContain('{2,3}');
    
    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('min only quantifier - {2,}', () => {
    // 1. Sample text
    const sample = 'a aa aaa aaaa aaaaa';

    // 2. Reference result
    const expectedMatches = ['aa', 'aaa', 'aaaa', 'aaaaa'];

    // 3. Reference regex
    const reference = /a{2,}/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration - $max: Infinity or undefined
    const config = {
      $content: 'a',
      $min: 2,
      $max: Infinity
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should generate {2,} (no upper bound)
    expect(assembled.source).toMatch(/\{2,\}/);
    expect(assembled.source).not.toContain('{2,Infinity}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('exact count quantifier - {3}', () => {
    // 1. Sample text
    const sample = 'a aa aaa aaaa';

    // 2. Reference result
    const expectedMatches = ['aaa', 'aaa'];

    // 3. Reference regex
    const reference = /a{3}/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration - $min === $max
    const config = {
      $content: 'a',
      $min: 3,
      $max: 3
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should generate {3} not {3,3}
    expect(assembled.source).toContain('{3}');
    expect(assembled.source).not.toContain('{3,3}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('optional quantifier - ? (min:0, max:1)', () => {
    // 1. Sample text
    const sample = 'color colour';

    // 2. Reference result
    const expectedMatches = ['color', 'colour'];

    // 3. Reference regex - 'u' is optional
    const reference = /colou?r/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $begin: 'colo',
      $content: 'u',
      $end: 'r',
      $min: 0,
      $max: 1
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should use ? not {0,1}
    expect(assembled.source).toMatch(/\?/);
    expect(assembled.source).not.toContain('{0,1}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('zero or more quantifier - * (min:0, max:∞)', () => {
    // 1. Sample text
    const sample = 'a aa aaa';

    // 2. Reference result
    const expectedMatches = ['a', 'aa', 'aaa'];

    // 3. Reference regex
    const reference = /a*/g;

    // 4. Verify reference (filter empty matches)
    const referenceMatches = sample.match(reference).filter(m => m.length > 0);
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $content: 'a',
      $min: 0,
      $max: Infinity
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should use * not {0,}
    expect(assembled.source).toContain('*');
    expect(assembled.source).not.toContain('{0,}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    const matches = sample.match(regex).filter(m => m.length > 0);
    expect(matches).toEqual(expectedMatches);
  });

  test('one or more quantifier - + (min:1, max:∞)', () => {
    // 1. Sample text
    const sample = 'a aa aaa';

    // 2. Reference result
    const expectedMatches = ['a', 'aa', 'aaa'];

    // 3. Reference regex
    const reference = /a+/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $content: 'a',
      $min: 1,
      $max: Infinity
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should use + not {1,}
    expect(assembled.source).toContain('+');
    expect(assembled.source).not.toContain('{1,}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('no quantifier when min:1, max:1', () => {
    // 1. Sample text
    const sample = 'abc';

    // 2. Reference result
    const expectedMatches = ['a'];

    // 3. Reference regex
    const reference = /a/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration - explicitly once
    const config = {
      $content: 'a',
      $min: 1,
      $max: 1
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should not add quantifier for "exactly once"
    expect(assembled.source).not.toContain('{1}');
    expect(assembled.source).not.toContain('{1,1}');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('$max with ∞ symbol', () => {
    // 5. RegXpChef configuration - using ∞ symbol
    const config = {
      $content: 'a',
      $min: 1,
      $max: '∞'
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should produce + quantifier
    expect(assembled.source).toContain('+');

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect('aaa'.match(regex)).toEqual(['aaa']);
  });

  test('invalid $min - negative number', () => {
    expect(() => {
      RegXpChef.compile({
        $content: 'a',
        $min: -1
      });
    }).toThrow(/non-negative integer/);
  });

  test('invalid $min - not an integer', () => {
    expect(() => {
      RegXpChef.compile({
        $content: 'a',
        $min: 2.5
      });
    }).toThrow(/non-negative integer/);
  });

  test('invalid $max - zero', () => {
    expect(() => {
      RegXpChef.compile({
        $content: 'a',
        $max: 0
      });
    }).toThrow(/greater than 0/);
  });

  test('invalid $max - less than $min', () => {
    expect(() => {
      RegXpChef.compile({
        $content: 'a',
        $min: 5,
        $max: 3
      });
    }).toThrow(/not less than \$min/);
  });

  test('quantifier with array $content throws error', () => {
    // According to code: $min/$max not valid with array $content
    expect(() => {
      RegXpChef.compile({
        $content: ['a', 'b'],
        $min: 2
      });
    }).toThrow(/not valid when \$content is an array/);
  });

});
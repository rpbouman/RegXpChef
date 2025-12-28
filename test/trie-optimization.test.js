const RegXpChef = require('../src/RegXpChef');

describe('trie optimization for string arrays', () => {

  test('shared prefix strings are factored using a trie', () => {
    // 1. Sample text
    const sample = 'if int in';

    // 2. Reference result
    const expectedMatches = ['if', 'int'];

    // 3. Reference regex
    // Shared prefix "i", followed by either "f" or "nt"
    const reference = /i(?:f|nt)/g;

    // 4. Verify reference regex (sanity check)
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== expectedMatches.length) {
      throw new Error('Test setup error: reference regex does not work as expected');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: ['if', 'int']
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);

    // Must start with the shared prefix
    expect(assembled.source.startsWith('i')).toBe(true);

    // Must contain an alternation
    expect(assembled.source).toMatch(/\|/);

    // Alternation must be wrapped (non-capturing group)
    expect(assembled.source).toMatch(/i\(\?\:(?:f\|nt|nt\|f)\)/);

    // Must not be a flat alternation like "if|int"
    expect(assembled.source).not.toMatch(/^if\|int$/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('terminal strings are handled as optional branches', () => {
    // 1. Sample text
    const sample = 'do dog dot';

    // 2. Reference result
    const expectedMatches = ['do', 'dog', 'dot'];

    // 3. Reference regex
    // "do" is terminal, with optional continuation
    const reference = /do(?:g|t)?/g;

    // 4. Verify reference regex
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== expectedMatches.length) {
      throw new Error('Test setup error: reference regex does not work as expected');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: ['do', 'dog', 'dot']
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);

    // Shared prefix must be present
    expect(assembled.source.startsWith('do')).toBe(true);

    // Optional branch must be present
    expect(assembled.source).toMatch(/\?/);

    // Alternation must be grouped
    expect(assembled.source).toMatch(/\(\?\:.*\|.*\)\?/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('no trie optimization for arrays containing non-strings', () => {
    // 1. Sample text
    const sample = 'ab ac';

    // 2. Reference result
    const expectedMatches = ['ab', 'ac'];

    // 3. Reference regex
    const reference = /a(?:b|c)/g;

    // 4. Verify reference regex
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $content: ['ab', /ac/]
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);

    // Should still contain alternation
    expect(assembled.source).toMatch(/\|/);

    // But trie-specific factoring is not guaranteed here
    // We only assert correctness, not optimization
    // (this guards against false assumptions about mixed arrays)

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

});

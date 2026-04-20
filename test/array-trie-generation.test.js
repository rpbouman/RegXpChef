const RegXpChef = require('../src/RegXpChef');

describe('Array trie optimization', () => {

  test('simple common prefix - cat/car/cap', () => {
    // 1. Sample text
    const sample = 'cat car cap dog';

    // 2. Reference result
    const expectedMatches = ['cat', 'car', 'cap'];

    // 3. Reference regex - trie-optimized by hand
    const reference = /\bca[prt]\b/g;

    // 4. Verify reference regex works (sanity check)
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== 3) {
      throw new Error('Test setup error: reference regex does not work');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['cat', 'car', 'cap'];

    // 6. Generate and verify syntax
    const assembled = RegXpChef.assemble(config);
    
    // Syntax check: trie should extract common prefix 'ca'
    // NOT naive: cat|car|cap
    // YES trie: ca(?:t|r|p) or ca[trp]
    
    // Check 1: Should not have naive full-word alternation
    expect(assembled.source).not.toMatch(/\bcat\|car\|cap\b/);
    
    // Check 2: Common prefix 'ca' should appear only once, not three times
    const prefixCount = (assembled.source.match(/ca/g) || []).length;
    expect(prefixCount).toBe(1);
    
    // Check 3: Should have grouping (characteristic of trie)
    expect(assembled.source).toBe('ca[prt]');

    // 7. Behavioral verification
    const regex = new RegExp(`\\b${assembled.source}\\b`, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('nested common prefix - testing/tested/test/tester', () => {
    // 1. Sample text
    const sample = 'testing tested test tester';

    // 2. Reference result
    const expectedMatches = ['testing', 'tested', 'test', 'tester'];

    // 3. Reference regex - trie with optional suffixes
    const reference = /\btest(?:ing|ed|er)?\b/g;

    // 4. Verify reference
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== 4) {
      throw new Error('Test setup error: reference regex does not work');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['testing', 'tested', 'test', 'tester'];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should not repeat 'test' four times
    const testCount = (assembled.source.match(/test/g) || []).length;
    expect(testCount).toBe(1);
    
    // Should have optional grouping for the base word 'test'
    // Pattern should be like: test(?:ing|ed|er)?
    expect(assembled.source).toMatch(/test\(\?:.*\)\?/);

    // 7. Behavioral verification
    const regex = new RegExp(`\\b${assembled.source}\\b`, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('long common prefix - photograph variants', () => {
    // 1. Sample text
    const sample = 'photograph photographer photographic photography';

    // 2. Reference result
    const expectedMatches = ['photograph', 'photographer', 'photographic', 'photography'];

    // 3. Reference regex
    const reference = /\bphotograph(?:er|ic|y)?\b/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['photograph', 'photographer', 'photographic', 'photography'];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Long prefix 'photograph' should appear exactly once
    const prefixCount = (assembled.source.match(/photograph/g) || []).length;
    expect(prefixCount).toBe(1);
    
    // Trie should be significantly shorter than naive alternation
    const naive = config.join('|');
    expect(assembled.source.length).toBeLessThan(naive.length);

    // 7. Behavioral verification
    const regex = new RegExp(`\\b${assembled.source}\\b`, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('no common prefix - unrelated words', () => {
    // 1. Sample text
    const sample = 'apple banana cherry';

    // 2. Reference result
    const expectedMatches = ['apple', 'banana', 'cherry'];

    // 3. Reference regex - simple alternation (no optimization possible)
    const reference = /\b(?:apple|banana|cherry)\b/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['apple', 'banana', 'cherry'];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should use alternation since no common prefix
    expect(assembled.source).toContain('|');
    
    // All three words should be present
    expect(assembled.source).toContain('apple');
    expect(assembled.source).toContain('banana');
    expect(assembled.source).toContain('cherry');

    // 7. Behavioral verification
    const regex = new RegExp(`\\b${assembled.source}\\b`, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('partial common prefix - function/for/finally/false', () => {
    // 1. Sample text
    const sample = 'function for finally false';

    // 2. Reference result
    const expectedMatches = ['function', 'for', 'finally', 'false'];

    // 3. Reference regex - trie extracts 'f' prefix
    const reference = /\bf(?:unction|or|inally|alse)\b/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['function', 'for', 'finally', 'false'];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Should extract 'f' as common prefix
    // Pattern should be: f(?:unction|or|inally|alse)
    
    // The 'f' should appear once at the beginning
    expect(assembled.source).toMatch(/^f\(\?:/);
    
    // Should not have 'function|for|finally|false' (naive)
    expect(assembled.source).not.toMatch(/function\|for\|finally\|false/);

    // 7. Behavioral verification
    const regex = new RegExp(`\\b${assembled.source}\\b`, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('mixed array - strings and regex - no trie optimization', () => {
    // 1. Sample text
    const sample = 'hello 123 world 456';

    // 2. Reference result (with global flag)
    const expectedMatches = ['hello', '123', '456'];

    // 3. Reference regex - simple alternation
    const reference = /hello|\d+/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration - mixed types
    const config = ['hello', /\d+/];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Cannot apply trie to mixed types, should use alternation
    expect(assembled.source).toContain('|');
    
    // Should contain escaped 'hello' and the digit pattern
    expect(assembled.source).toContain('hello');
    expect(assembled.source).toMatch(/\\d\+/);

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('single string - no optimization needed', () => {
    // 1. Sample text
    const sample = 'hello world hello';

    // 2. Reference result
    const expectedMatches = ['hello', 'hello'];

    // 3. Reference regex
    const reference = /hello/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = ['hello'];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Single string should just be escaped
    expect(assembled.source).toContain('hello');
    
    // Should not have unnecessary grouping
    expect(assembled.source).not.toMatch(/\(\?:hello\)/);

    // 7. Behavioral verification
    const regex = new RegExp(assembled.source, 'g');
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('empty array', () => {
    // 5. RegXpChef configuration
    const config = [];

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    
    // Empty array should produce empty pattern
    expect(assembled.source).toBe('');
    
    // 7. Behavioral verification
    const regex = new RegExp(assembled.source || '(?!)', 'g');
    expect('anything'.match(regex)).toBeNull();
  });

  test('sql keywords', () => {
    const config = {
      $begin: /\b/,
      $end: /\b/,
      $content: [
        "all","analyse","analyze","and","anti","any","array","as","asc","asof","asymmetric","at","authorization","between","bigint","binary","bit","boolean","both","by","case","cast","char","character","check","coalesce","collate","collation","column","columns","concurrently","constraint","create","cross","dec","decimal","default","deferrable","desc","describe","distinct","do","else","end","except","exists","extract","false","fetch","float","for","foreign","freeze","from","full","generated","glob","group","grouping","grouping_id","having","ilike","in","initially","inner","inout","int","integer","intersect","interval","into","is","isnull","join","lambda","lateral","leading","left","like","limit","map","national","natural","nchar","none","not","notnull","null","nullif","numeric","offset","on","only","or","order","out","outer","overlaps","overlay","pivot","pivot_longer","pivot_wider","placing","position","positional","precision","primary","qualify","real","references","returning","right","row","select","semi","setof","show","similar","smallint","some","struct","substring","summarize","symmetric","table","tablesample","then","time","timestamp","to","trailing","treat","trim","true","try_cast","union","unique","unpack","unpivot","using","values","varchar","variadic","verbose","when","where","window","with","xmlattributes","xmlconcat","xmlelement","xmlexists","xmlforest","xmlnamespaces","xmlparse","xmlpi","xmlroot","xmlserialize","xmltable"
      ],
      $flags: 'i'
    };
    const regExp = RegXpChef.compile({$flags:'sg'}, config);
    const input = config.$content.join(' ');
    const matches = Array.from(input.matchAll(regExp)).map(match => match[0]);
    expect(matches).toEqual(config.$content);
    
  });

});
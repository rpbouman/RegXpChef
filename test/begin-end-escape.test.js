const RegXpChef = require('../src/RegXpChef');

describe('begin, end, and escape handling', () => {

  test('$escape and $end are identical strings, matches content continaing escaped end sequence', () => {
    // 1. Sample text - content with escaped end markers
    const sample = 'BEGIN text ENDEND more text END BEGIN simple END';

    // 2. Reference result - what we expect to match
    const expectedMatches = [
      'BEGIN text ENDEND more text END',  // First: escaped END, then real END
      'BEGIN simple END'                  // Second: normal begin/end pair
    ];

    // 3. Reference regex - manually crafted to handle escapes
    // Pattern: BEGIN + (ENDEND | non-END-starting-content)* + END
    const reference = /BEGIN(?:ENDEND|(?!END)[\s\S])*END/g;

    // 4. Verify reference regex works (sanity check)
    const referenceMatches = sample.match(reference);
    if (!referenceMatches || referenceMatches.length !== expectedMatches.length) {
      throw new Error('Test setup error: reference regex does not work as expected');
    }
    expect(referenceMatches).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $begin: 'BEGIN',
      $end: 'END',
      $escape: 'END',
      $min: 0
    };

    // 6. Syntax verification - check generated pattern structure
    const assembled = RegXpChef.assemble(config);
    
    // Should contain negative lookahead for end detection
    expect(assembled.source).toMatch(/\(\?\!/);
    
    // Should contain the escape sequence pattern (ENDEND)
    expect(assembled.source).toMatch(/ENDEND/);
    
    // Should contain alternation (|) between escape and content
    expect(assembled.source).toMatch(/ENDEND.*\|/);
    
    // Should wrap the alternation properly
    expect(assembled.source).toMatch(/\(\?\:.*ENDEND.*\|.*\)/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('escape specified still matches content without escape sequence', () => {
    // 1. Sample text - no escape sequences present
    const sample = 'BEGIN normal content END BEGIN more END';

    // 2. Reference result
    const expectedMatches = ['BEGIN normal content END', 'BEGIN more END'];

    // 3. Reference regex - same pattern but no escapes triggered
    const reference = /BEGIN(?:ENDEND|(?!END)[\s\S])*?END/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration - same as above
    const config = {
      $flags: 'g',
      $begin: 'BEGIN',
      $end: 'END',
      $escape: 'END',
      $min: 0
    };

    // 6. Syntax verification - pattern should be identical
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/\(\?\!/);
    expect(assembled.source).toMatch(/ENDEND/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('multiple consecutive escapes', () => {
    // 1. Sample text - multiple escape sequences
    const sample = 'BEGIN ENDENDEND text END';

    // 2. Reference result - all escapes consumed, then real end
    const expectedMatches = ['BEGIN ENDENDEND'];

    // 3. Reference regex
    const reference = /BEGIN(?:ENDEND|(?!END)[\s\S])*END/g;

    // 4. Verify reference
    expect(sample.match(reference)).toEqual(expectedMatches);


    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $begin: 'BEGIN',
      $end: 'END',
      $escape: 'END'
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/ENDEND/);
    expect(assembled.source).toMatch(/\(\?\!/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('escape at end of input - no match', () => {
    // 1. Sample text - ends with escape, no real end marker
    const sample = 'BEGIN content xEND';

    // 2. Reference result - no complete match possible
    const expectedMatches = [];

    // 3. Reference regex
    const reference = /BEGIN(?:xEND|(?!x?END)[\s\S])*END/g;

    // 4. Verify reference
    const referenceMatches = sample.match(reference);
    expect(referenceMatches).toBeNull(); // No matches

    // 5. RegXpChef configuration
    const config = {
      $begin: 'BEGIN',
      $end: 'END',
      $escape: 'x'
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/xEND/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toBeNull();
  });

  test('$escape and $end are distinct single characters and matches content containing escaped end sequence', () => {
    // 1. Sample text 
    const sample = '"bla \\""';

    // 2. Reference result - no complete match possible
    const expectedMatches = [sample];

    // 3. Reference regex
    const reference = /"(?:\\"|(?!")[\s\S])*"/g;

    // 4. Verify reference
    const referenceMatches = sample.match(reference);
    expect(sample.match(reference)).toEqual(expectedMatches);

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $begin: '"',
      $end: '"',
      $escape: '\\'
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/\\"/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toEqual(expectedMatches);
  });

  test('$escape and $end are distinct single characters and does not match content ending with escaped end sequence and lacking terminal end sequence', () => {
    // 1. Sample text 
    const sample = '"bla \\"';

    // 2. Reference result - no complete match possible
    const expectedMatches = [sample];

    // 3. Reference regex
    const reference = /"(?:\\"|(?!")[\s\S])*(?<!\\)"/g;

    // 4. Verify reference
    const referenceMatches = sample.match(reference);
    expect(sample.match(reference)).toBeNull();

    // 5. RegXpChef configuration
    const config = {
      $flags: 'g',
      $begin: '"',
      $end: '"',
      $escape: '\\'
    };

    // 6. Syntax verification
    const assembled = RegXpChef.assemble(config);
    expect(assembled.source).toMatch(/\\"/);

    // 7. Behavioral verification
    const regex = RegXpChef.compile(config);
    expect(sample.match(regex)).toBeNull();
  });


});
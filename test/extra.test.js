// tests/RegXpChef.test.js

const RegXpChef = require('../src/RegXpChef');

describe('RegXpChef - Character Class Edge Cases', () => {
  
  test('escaped closing bracket in character class', () => {
    // Pattern that matches a closing bracket
    const pattern = /[\]]/;
    const result = RegXpChef.compile(pattern);
    expect(result.source).toContain('[\\]]');
  });

  test('escaped backslash in character class', () => {
    // Pattern that matches a backslash
    const pattern = /[\\]/;
    const result = RegXpChef.compile(pattern);
    expect(result.source).toContain('[\\\\]');
  });

  test('character class with brackets as literals', () => {
    // Should match opening or closing bracket
    const pattern = /[\[\]]/;
    const result = RegXpChef.compile(pattern);
    expect(() => new RegExp(result.source)).not.toThrow();
    expect('[]'.match(result)).toBeTruthy();
  });

  test('multiple character classes with quantifier', () => {
    const result = RegXpChef.compile({
      $content: /[a-z][0-9]/,
      $min: 1,
      $max: 3
    });
    expect(() => new RegExp(result.source)).not.toThrow();
    // Should properly wrap [a-z][0-9] before adding quantifier
    expect(result.source).toMatch(/\{1,3\}/);
  });

  test('alternation with character classes', () => {
    // These are strings that become character classes in trie
    const result = RegXpChef.compile(['[a]', '[b]']);
    // Both should be properly escaped
    expect(result.source).toContain('\\[');
    expect(result.source).toContain('\\]');
  });

  test('complex nested pattern from array', () => {
    const result = RegXpChef.compile([/[\]]/, /[\\]/]);
    expect(() => new RegExp(result.source)).not.toThrow();
    // Should create valid alternation
    expect(result).toBeInstanceOf(RegExp);
  });
});

describe('RegXpChef - Quantifier Wrapping Issues', () => {
  
  test('alternation needs wrapping before quantifier', () => {
    const result = RegXpChef.compile({
      $content: /a|b/,
      $min: 2,
      $max: 4
    });
    // Should wrap alternation: (?:a|b){2,4} not a|b{2,4}
    const testStr = 'abab';
    expect(testStr.match(result)).toBeTruthy();
    expect(result.source).toMatch(/\(\?:.*\|.*\)/);
  });

  test('multiple elements need wrapping for quantifier', () => {
    const result = RegXpChef.compile({
      $content: /ab/,
      $min: 2,
      $max: 2
    });
    // Should be: (?:ab){2,2} or (ab){2}
    expect('abab'.match(result)).toBeTruthy();
    expect('ab'.match(result)).toBeFalsy();
  });

  test('pipe character requires wrapping', () => {
    const result = RegXpChef.compile({
      $content: 'a|b',
      $min: 0,
      $max: 1
    });
    // Escaped pipe should not be treated as alternation
    expect(result.source).toContain('\\|');
  });
});

describe('RegXpChef - Invalid Regex Detection', () => {
  
  test('should handle malformed character class gracefully', () => {
    // If someone passes a string with unmatched brackets
    const str = '[[]';
    const result = RegXpChef.compile(str);
    // Should escape the brackets, not create invalid regex
    expect(() => new RegExp(result.source)).not.toThrow();
    expect(result.source).toBe('\\[\\[\\]');
  });

  test('should handle closing bracket without opening', () => {
    const str = '[]]';
    const result = RegXpChef.compile(str);
    expect(() => new RegExp(result.source)).not.toThrow();
    expect(result.source).toBe('\\[\\]\\]');
  });

  test('regex with unescaped special chars in string', () => {
    const result = RegXpChef.compile('a.b*c+d?');
    expect(result.source).toBe('a\\.b\\*c\\+d\\?');
    expect('a.b*c+d?'.match(result)).toBeTruthy();
    expect('aXbYcZd'.match(result)).toBeFalsy();
  });
});

describe('RegXpChef - Trie Optimization Edge Cases', () => {
  
  test('keywords with special regex chars', () => {
    const keywords = ['a.b', 'a*c', 'a+d'];
    const result = RegXpChef.compile(keywords);
    
    // All special chars should be escaped
    expect(result.source).toContain('\\.');
    expect(result.source).toContain('\\*');
    expect(result.source).toContain('\\+');
    
    // Should match literally
    expect('a.b'.match(result)).toBeTruthy();
    expect('aXb'.match(result)).toBeFalsy();
  });

  test('keywords with brackets', () => {
    const keywords = ['[foo]', '[bar]'];
    const result = RegXpChef.compile(keywords);
    
    // Brackets should be escaped
    expect(result.source).toContain('\\[');
    expect(result.source).toContain('\\]');
    
    expect('[foo]'.match(result)).toBeTruthy();
    expect('foo'.match(result)).toBeFalsy();
  });

  test('mixed regex and strings in array', () => {
    const result = RegXpChef.compile([
      'literal',
      /[a-z]+/,
      '[test]'
    ]);
    
    expect(() => new RegExp(result.source)).not.toThrow();
    expect('literal'.match(result)).toBeTruthy();
    expect('abc'.match(result)).toBeTruthy();
    expect('[test]'.match(result)).toBeTruthy();
  });
});

describe('RegXpChef - Begin/End with Escapes', () => {
  
  test('string literal with backslash escape', () => {
    const result = RegXpChef.compile({
      $begin: '"',
      $end: '"',
      $escape: '\\'
    });
    
    expect(() => new RegExp(result.source)).not.toThrow();
    
    // Should match: "hello \"world\""
    const match = '"hello \\"world\\""'.match(result);
    expect(match).toBeTruthy();
  });

  test('character class as delimiter', () => {
    const result = RegXpChef.compile({
      $begin: /[\[\{]/,
      $end: /[\]\}]/
    });
    
    expect(() => new RegExp(result.source)).not.toThrow();
    expect('[content]'.match(result)).toBeTruthy();
    expect('{content}'.match(result)).toBeTruthy();
  });

  test('same character as begin and escape', () => {
    // Edge case: what if escape char is same as delimiter?
    const result = RegXpChef.compile({
      $begin: "'",
      $end: "'",
      $escape: "'"
    });
    
    expect(() => new RegExp(result.source)).not.toThrow();
  });
});

describe('RegXpChef - Module System', () => {
  
  test('CommonJS export exists', () => {
    expect(RegXpChef).toBeDefined();
    expect(typeof RegXpChef.compile).toBe('function');
  });

  test('has all documented static methods', () => {
    expect(typeof RegXpChef.compile).toBe('function');
    expect(typeof RegXpChef.assemble).toBe('function');
    expect(typeof RegXpChef.escape).toBe('function');
    expect(typeof RegXpChef.groupCounts).toBe('function');
    expect(typeof RegXpChef.matchGroups).toBe('function');
  });
});

describe('RegXpChef - Documented API', () => {
  
  test('escape method handles all special chars', () => {
    const input = '.*+?^${}()|[]\\';
    const result = RegXpChef.escape(input);
    expect(result).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  test('matchGroups returns matched group names', () => {
    const pattern = /(?<letter>[a-z])?(?<digit>\d)?/;
    
    const match1 = 'a1'.match(pattern);
    const groups1 = RegXpChef.matchGroups(match1);
    expect(groups1).toContain('letter');
    expect(groups1).toContain('digit');
    
    const match2 = 'a'.match(pattern);
    const groups2 = RegXpChef.matchGroups(match2);
    expect(groups2).toContain('letter');
    expect(groups2).not.toContain('digit');
  });

  test('assemble returns source and flags', () => {
    const result = RegXpChef.assemble(
      { $flags: 'gi' },
      'test',
      /pattern/
    );
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('flags');
    expect(result.flags).toBe('gi');
  });
});

describe('RegXpChef - Real World Tokenizer Use Cases', () => {
  
  test('SQL keywords optimization', () => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 
      'DELETE', 'CREATE', 'ALTER', 'DROP'
    ];
    const result = RegXpChef.compile(
      { $flags: 'i' }, 
      { $begin: /\b/, $content: keywords, $end: /\b/ }
    );
    
    expect('SELECT'.match(result)).toBeTruthy();
    expect('select'.match(result)).toBeTruthy();
    expect('SELECTX'.match(result)).toBeFalsy();
  });

  test('string literal with escape sequences', () => {
    const stringPattern = {
      $begin: '"',
      $end: '"',
      $escape: '\\',
      $flags: 'g'
    };
    const result = RegXpChef.compile(stringPattern);
    
    const input = '"hello" "world" "quote: \\"test\\""';
    const matches = input.match(result);
    expect(matches).toHaveLength(3);
  });

  test('multi-line comment', () => {
    const comment = {
      $begin: '/*',
      $end: '*/',
      $flags: 's'
    };
    const result = RegXpChef.compile(comment);
    
    const input = '/* comment\nwith newline */';
    expect(input.match(result)).toBeTruthy();
  });

  test('identifier pattern', () => {
    const identifier = {
      $begin: /\b[a-zA-Z_]/,
      $content: /[a-zA-Z0-9_]\b/,
      $min: 0,
      $max: Infinity
    };
    const result = RegXpChef.compile(identifier);
    
    expect('variable123'.match(result)).toBeTruthy();
    expect('_private'.match(result)).toBeTruthy();
    expect('123invalid'.match(result)).toBeFalsy();
  });
  
  
  test('trie with pipe character in keywords', () => {
    // If keywords contain '|', they should be escaped as literals
    // The trie might not wrap branches correctly when combining with terminals
    const keywords = ['a|b', 'c'];
    const result = RegXpChef.compile(keywords);
        
    // Should match the literal strings 'a|b' and 'c'
    expect('a|b'.match(result)[0]).toBe('a|b');
    expect('c'.match(result)[0]).toBe('c');
    
    // Should NOT match 'a' or 'b' separately (the | should be literal)
    const resultWithAnchors = new RegExp(`^${result.source}$`);
    expect('a'.match(resultWithAnchors)).toBeFalsy();
    expect('b'.match(resultWithAnchors)).toBeFalsy();
  });

  test('character class lookbehind check with escaped backslash', () => {
    // Pattern [\\] ends with \] which breaks the lookbehind (?<!\\)
    // Used in #fromTrie line: !/^\[.+(?<!\\)\]$/.test(branchSource)
    
    // If trie generates [\\] internally, the check thinks it's not a character class
    // Force this by creating a pattern that generates character class with backslash
    const keywords = ['\\a', '\\b', '\\c'];
    const result = RegXpChef.compile(keywords);
        
    // Should match these literal strings
    expect('\\a'.match(result)).toBeTruthy();
    expect('\\b'.match(result)).toBeTruthy();
  });

  test('alternation in trie without proper wrapping', () => {
    // When #fromTrie builds "terminals|source", it might not wrap properly
    // This can cause precedence issues
    
    const keywords = ['ab', 'a'];
    const result = RegXpChef.compile(keywords);
    
    // Try using it with a quantifier
    const withQuantifier = new RegExp(`(${result.source})+`);
    
    // 'abab' should match
    const match = 'abab'.match(withQuantifier);
    expect(match).toBeTruthy();
    expect(match[0]).toBe('abab');
  });

  test('character class with backslash-backslash-bracket', () => {
    // The pattern [\\]] means: match \ or ]
    // But lookbehind (?<!\\) would see \] and think the ] is escaped
    
    // Create scenario where this pattern might be generated
    const result = RegXpChef.compile({
      $content: /[\\\]]/,  // This is the problematic pattern
      $min: 1,
      $max: 3
    });
    
    // Should still work correctly
    expect('\\\\\\'.match(result)).toBeTruthy(); // Three backslashes
    expect(']]]'.match(result)).toBeTruthy(); // Three ]
  });

  test('ACTUAL BUG: trie terminal/branch concatenation', () => {
    // In #fromTrie, when combining terminals and branches:
    // source = terminals + source  (with | in between if both exist)
    // But if terminals OR source contain unwr apped alternations, precedence breaks
    
    const keywords = ['x', 'ab', 'ac'];
    const result = RegXpChef.compile(keywords);
    
    // Expected: something like x|a[bc] or x|ab|ac
    // Let's see if it matches correctly
    
    const pattern = new RegExp(`^${result.source}$`);
    expect('x'.match(pattern)).toBeTruthy();
    expect('ab'.match(pattern)).toBeTruthy();
    expect('ac'.match(pattern)).toBeTruthy();
    expect('a'.match(pattern)).toBeFalsy();
    expect('xy'.match(pattern)).toBeFalsy();
  });

  
});
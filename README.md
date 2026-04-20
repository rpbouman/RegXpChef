# RegXpChef

A declarative regular expression builder for tokenizers, parsers, and syntax highlighters.

## Installation

```bash
npm install regxpchef
```

## Overview

`RegXpChef.compile()` takes one or more arguments and generates a `RegExp` object based on the input. Arguments can be strings, arrays, regular expressions, or objects that describe patterns declaratively.

```javascript
const RegXpChef = require('regxpchef');

const pattern = RegXpChef.compile('hello');
console.log(pattern.test('hello')); // true
```

## Argument Types

### String Arguments

Strings are automatically escaped and matched literally:

```javascript
const pattern = RegXpChef.compile('a.b*c?');
console.log(pattern.source);
// a\\.b\\*c\\?

console.log(pattern.test('a.b*c?')); // true
console.log(pattern.test('aXbYcZ')); // false
```

### Array Arguments

Arrays of strings generate optimized alternation patterns using a trie structure:

```javascript
const pattern = RegXpChef.compile(['function', 'for', 'if', 'return']);
console.log(pattern.source);
// f(?:or|unction)|return|if
```

Arrays with mixed content produce simple alternation:

```javascript
const pattern = RegXpChef.compile([/\d+/, 'hello', /\w+/]);
console.log(pattern.source);
// \d+|hello|\w+
```

### RegExp Arguments

Regular expressions are incorporated directly into the pattern:

```javascript
const pattern = RegXpChef.compile(/\d{3}-\d{4}/);
console.log(pattern.source);
// \d{3}-\d{4}
```

### Object Arguments with $ Properties

Objects with `$` prefixed properties define patterns with delimiters, content, and quantifiers.

#### Basic Delimited Patterns

Use `$begin` and `$end` to define delimiters. Both accept strings, regular expressions, or arrays:

```javascript
const pattern = RegXpChef.compile({
  $begin: '"',
  $end: '"'
});
// Matches: "hello world"
```

With regular expressions:

```javascript
const pattern = RegXpChef.compile({
  $begin: /<<[A-Z]+/,
  $end: /[A-Z]+>>/
});
// Matches: <<HEREDOC...HEREDOC>>
```

When only `$begin` or `$end` is specified:

```javascript
const pattern = RegXpChef.compile({
  $begin: '//',
  $end: '\n'
});
// Matches line comments
```

#### Escape Sequences

The `$escape` property handles escape sequences. It accepts strings, regular expressions, or arrays:

```javascript
const pattern = RegXpChef.compile({
  $begin: '"',
  $end: '"',
  $escape: '\\'
});
// Matches: "hello \"world\""
```

The `$escape` property requires `$end` to be specified.

#### Custom Content

The `$content` property specifies what appears between delimiters. It accepts strings, regular expressions, or arrays:

```javascript
const pattern = RegXpChef.compile({
  $begin: '/*',
  $end: '*/',
  $content: /[^*]|\*(?!\/)/
});
// Matches: /* comment */
```

With an array of alternatives:

```javascript
const pattern = RegXpChef.compile({
  $begin: '{',
  $end: '}',
  $content: ['red', 'green', 'blue']
});
// Matches: {red}, {green}, or {blue}
```

When `$content` is an array, quantifier properties (`$min`, `$max`, `$escape`) are not allowed.

#### Quantifiers

Use `$min` and `$max` to control repetition. Both accept non-negative integers:

```javascript
const pattern = RegXpChef.compile({
  $content: /\d/,
  $min: 3,
  $max: 5
});
// Matches 3 to 5 consecutive digits
```

Use `Infinity` or `'∞'` for unlimited repetition:

```javascript
const pattern = RegXpChef.compile({
  $content: /\w/,
  $min: 1,
  $max: Infinity
});
// Equivalent to \w+
```

Default values:
- When `$end` is specified: `$min` defaults to 0, `$max` defaults to Infinity
- Otherwise: `$min` defaults to 1, `$max` defaults to 1

#### Exclusive Delimiters

Use `$beginExclusive` and `$endExclusive` to create lookbehind/lookahead assertions:

```javascript
const pattern = RegXpChef.compile({
  $begin: '\\b',
  $beginExclusive: true,
  $content: /\w+/,
  $end: '\\b',
  $endExclusive: true
});
// Matches word boundaries without consuming them
```

#### Complete Example

```javascript
const stringLiteral = RegXpChef.compile({
  $begin: '"',
  $end: '"',
  $escape: '\\',
  $min: 0,
  $max: Infinity
});
// Matches string literals with escape sequences
```

### Object Arguments for Named Groups

Objects without `$` prefixed properties create named capture groups:

```javascript
const pattern = RegXpChef.compile({
  keyword: ['function', 'return', 'const'],
  number: /\d+/,
  identifier: /[a-zA-Z_]\w*/
});

const match = 'function'.match(pattern);
console.log(match.groups);
// { keyword: 'function', number: undefined, identifier: undefined }
```

Each property name becomes a group label, and the property value can be any valid argument type (string, array, RegExp, or object with `$` properties):

```javascript
const pattern = RegXpChef.compile({
  string: {
    $begin: '"',
    $end: '"',
    $escape: '\\'
  },
  number: /\d+(\.\d+)?/,
  operator: ['===', '==', '=']
});
```

## Combining Multiple Arguments

Pass multiple arguments to combine patterns sequentially:

```javascript
const pattern = RegXpChef.compile(
  /^\s*/,
  'SELECT',
  /\s+/,
  /[a-zA-Z_]\w*/
);
console.log(pattern.source);
// ^\s*SELECT\s+[a-zA-Z_]\w*
```

## Flags

### Global Flags

Set flags for the entire pattern using the first argument:

```javascript
const pattern = RegXpChef.compile(
  { $flags: 'gi' },
  ['hello', 'world']
);
// Case-insensitive and global matching
```

Alternatively, use the `flags` property:

```javascript
const pattern = RegXpChef.compile(
  { flags: 'gi' },
  ['hello', 'world']
);
```

### Local Flags

Regular expression arguments can have different flags. The flags `m`, `i`, and `s` can be modified locally:

```javascript
const pattern = RegXpChef.compile(
  { $flags: '' },
  /hello/i,
  ' ',
  /world/
);
console.log(pattern.source);
// (?i:hello) world
// Only 'hello' is case-insensitive
```

## Helper Functions

### `RegXpChef.assemble(...args)`

Like `compile()`, but returns `{ source, flags }` instead of a `RegExp`:

```javascript
const result = RegXpChef.assemble(
  { $flags: 'g' },
  /\d+/,
  ['a', 'b', 'c']
);
console.log(result);
// { source: '\\d+(?:a|b|c)', flags: 'g' }

const pattern = new RegExp(result.source, result.flags);
```

### `RegXpChef.escape(source)`

Escapes a string for literal matching in regular expressions:

```javascript
const escaped = RegXpChef.escape('a.b*c?');
console.log(escaped);
// a\\.b\\*c\\?
```

### `RegXpChef.matchGroups(match)`

Returns an array of group names that were matched (excludes undefined groups):

```javascript
const pattern = RegXpChef.compile({
  keyword: ['if', 'else'],
  number: /\d+/,
  identifier: /[a-z]+/
});

const match = 'if'.match(pattern);
console.log(RegXpChef.matchGroups(match));
// ['keyword']
```

### `RegXpChef.groupCounts(source)`

Counts occurrences of each named capture group in a pattern:

```javascript
const pattern = RegXpChef.compile(
  { keyword: ['if', 'else'] },
  ' ',
  { keyword: ['then', 'do'] }
);

const counts = RegXpChef.groupCounts(pattern);
console.log(counts);
// { keyword: 2 }
```

## Example: JavaScript Tokenizer

```javascript
const RegXpChef = require('regxpchef');

const tokenPattern = RegXpChef.compile(
  { $flags: 'g' },
  {
    whitespace: /\s+/,
    comment: {
      $begin: '//',
      $end: '\n'
    },
    string: {
      $begin: '"',
      $end: '"',
      $escape: '\\'
    },
    keyword: ['function', 'return', 'const', 'let', 'if', 'else'],
    number: /\d+(\.\d+)?/,
    identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    operator: ['===', '==', '=', '+', '-', '*', '/'],
    punctuation: ['(', ')', '{', '}', ';', ',']
  }
);

function tokenize(source) {
  const tokens = [];
  let match;
  
  while ((match = tokenPattern.exec(source)) !== null) {
    const groups = RegXpChef.matchGroups(match);
    const type = groups[0];
    const value = match[0];
    tokens.push({ type, value, index: match.index });
  }
  
  return tokens;
}

const code = 'const x = 42; // comment\nfunction hello() { return "world"; }';
const tokens = tokenize(code);
console.log(tokens);
/*
[
  { type: 'keyword', value: 'const', index: 0 },
  { type: 'whitespace', value: ' ', index: 5 },
  { type: 'identifier', value: 'x', index: 6 },
  { type: 'whitespace', value: ' ', index: 7 },
  { type: 'operator', value: '=', index: 8 },
  { type: 'whitespace', value: ' ', index: 9 },
  { type: 'number', value: '42', index: 10 },
  { type: 'punctuation', value: ';', index: 12 },
  ...
]
*/
```

## License

MIT
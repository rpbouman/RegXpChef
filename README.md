# RegXpChef

A declarative regular expression builder for tokenizers, parsers, and syntax highlighters.

## Installation

```bash
npm install regxpchef
```

## Usage

```javascript
const RegXpChef = require('regxpchef');

// Compile a regular expression from declarative syntax
const pattern = RegXpChef.compile({ 
  $begin: '"',
  $end: '"',
  $escape: '\\'
});

console.log(pattern);
// /(?:")(?:(?:\\)(?:")|(?!")[\s\S])*(?:")/
```

## Features

### String Escaping

Strings are automatically escaped for use in regular expressions:

```javascript
const pattern = RegXpChef.compile('(Hello)');
console.log(pattern.source);
// \(Hello\)
```

Use `RegXpChef.escape()` to escape strings manually:

```javascript
const escaped = RegXpChef.escape('a.b*c?');
// 'a\\.b\\*c\\?'
```

### Arrays as Alternatives

Arrays generate optimized alternation patterns. String arrays are converted to trie structures for efficiency:

```javascript
const pattern = RegXpChef.compile(['function', 'for', 'if', 'return']);
console.log(pattern.source);
// f(?:or|unction)|return|if
```

Mixed arrays produce simple alternation:

```javascript
const pattern = RegXpChef.compile([/\d+/, 'text']);
console.log(pattern.source);
// \d+|text
```

### Delimited Patterns

Objects with `$` prefixed properties define patterns with delimiters:

```javascript
const stringLiteral = RegXpChef.compile({
  $begin: '"',
  $end: '"'
});
// Matches: "hello world"
```

### Escape Sequences

The `$escape` property handles escape sequences within delimited patterns:

```javascript
const pattern = RegXpChef.compile({
  $begin: '"',
  $end: '"',
  $escape: '\\'
});
// Matches: "hello \"world\""
```

### Custom Content

Specify what appears between delimiters using `$content`:

```javascript
const pattern = RegXpChef.compile({
  $begin: '/*',
  $end: '*/',
  $content: /[^*]|\*(?!\/)/
});
// Matches: /* comment */
```

### Quantifiers

Control repetition with `$min` and `$max`:

```javascript
const pattern = RegXpChef.compile({
  $content: /\d/,
  $min: 3,
  $max: 5
});
// Matches 3 to 5 digits
```

```javascript
const pattern = RegXpChef.compile({
  $content: /\w/,
  $min: 1,
  $max: Infinity
});
// Equivalent to \w+
```

### Named Groups

Objects without `$` prefixed properties create named capture groups:

```javascript
const pattern = RegXpChef.compile({
  keyword: ['function', 'return', 'if'],
  number: /\d+/,
  string: { $begin: '"', $end: '"', $escape: '\\' }
});

const match = 'function'.match(pattern);
console.log(match.groups);
// { keyword: 'function', number: undefined, string: undefined }
```

Use `RegXpChef.matchGroups()` to get only the matched groups:

```javascript
const matched = RegXpChef.matchGroups(match);
// ['keyword']
```

### Flags

Set flags using `$flags` or the `flags` property:

```javascript
const pattern = RegXpChef.compile(
  { $flags: 'i' },
  ['hello', 'world']
);
// Case-insensitive matching
```

### Assembly

Use `RegXpChef.assemble()` to combine multiple patterns:

```javascript
const result = RegXpChef.assemble(
  { $flags: 'g' },
  /^\s*/,
  {
    keyword: ['SELECT', 'FROM', 'WHERE'],
    identifier: /[a-zA-Z_]\w*/,
    number: /\d+/
  }
);

const pattern = new RegExp(result.source, result.flags);
```

## Example: Simple Tokenizer

This example creates a tokenizer for a subset of JavaScript tokens:

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

## API Reference

### `RegXpChef.compile(...args)`

Compiles arguments into a `RegExp` object. Returns a `RegExp`.

### `RegXpChef.assemble(...args)`

Assembles arguments into a pattern descriptor. Returns `{ source: string, flags: string }`.

### `RegXpChef.escape(source)`

Escapes a string for literal matching in regular expressions. Returns a string.

### `RegXpChef.matchGroups(match)`

Extracts the names of matched capture groups from a match result. Returns an array of group names.

### `RegXpChef.groupCounts(source)`

Counts occurrences of each named capture group in a pattern. Returns an object mapping group names to counts.

## Object Properties

Objects with `$` prefixed properties are treated as pattern descriptors:

- `$begin` - Pattern that must precede the content
- `$end` - Pattern that must follow the content
- `$beginExclusive` - If `true`, uses a lookbehind for `$begin`
- `$endExclusive` - If `true`, uses a lookahead for `$end`
- `$content` - The pattern to match between delimiters
- `$escape` - Escape sequence pattern (requires `$end`)
- `$min` - Minimum repetitions (default: 0 if `$end` specified, else 1)
- `$max` - Maximum repetitions (default: Infinity if `$end` specified, else 1)
- `$flags` - Regular expression flags

Objects without `$` prefixed properties create named capture groups where each property name becomes a group label.

## License

MIT
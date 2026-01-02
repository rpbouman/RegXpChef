/**
 * Configuration object with $-prefixed directives
 */
interface RegXpChefConfig {
  /** Regex flags (e.g., 'gi', 'mis') */
  $flags?: string;
  
  /** Begin delimiter/boundary pattern */
  $begin?: RegExp | string;
  
  /** Use lookahead/lookbehind for begin (doesn't consume) */
  $beginExclusive?: boolean;
  
  /** End delimiter/boundary pattern */
  $end?: RegExp | string;
  
  /** Use lookahead/lookbehind for end (doesn't consume) */
  $endExclusive?: boolean;
  
  /** Content pattern (undefined = any character) */
  $content?: RegXpChefPattern | RegXpChefPattern[];
  
  /** Escape sequence for delimiters */
  $escape?: RegExp | string;
  
  /** Minimum repetitions (default: 1, or 0 if $end present) */
  $min?: number;
  
  /** Maximum repetitions (default: 1, or Infinity if $end present) */
  $max?: number | typeof Infinity | '∞';
}

/**
 * Token definitions - creates named capture groups
 * Each key becomes a group name, each value is the pattern
 */
type RegXpChefTokens = Record<string, RegXpChefPattern>;

/**
 * Valid pattern types that can be composed
 */
type RegXpChefPattern = 
  | RegExp                    // Preserves flags, source extracted
  | string                    // Auto-escaped
  | RegXpChefConfig           // DSL object
  | RegXpChefPattern[];       // Array of alternatives (optimized via trie if all strings)

/**
 * Valid input types for assemble/compile methods
 */
type RegXpChefInput = 
  | RegExp
  | RegXpChefConfig
  | RegXpChefTokens
  | RegXpChefPattern;

/**
 * RegXpChef - Declarative regular expression construction library
 */
declare class RegXpChef {
  /**
   * Compiles input patterns into a RegExp object
   * @param args - One or more patterns to compile. First arg's flags apply to all.
   * @returns Compiled RegExp
   * @example
   * RegXpChef.compile({ $flags: 'gi' }, 'hello', /world/)
   * // => /hello(?:world)/gi
   */
  static compile(...args: RegXpChefInput[]): RegExp;

  /**
   * Assembles patterns into source string and flags (without compiling)
   * @param args - One or more patterns to assemble
   * @returns Object with source and flags properties
   * @example
   * RegXpChef.assemble({ $flags: 'i' }, 'test')
   * // => { source: 'test', flags: 'i' }
   */
  static assemble(...args: RegXpChefInput[]): { source: string; flags: string };

  /**
   * Escapes special regex characters in a string
   * @param source - String to escape
   * @returns Escaped string safe for regex
   * @example
   * RegXpChef.escape('a.b*c')
   * // => 'a\\.b\\*c'
   */
  static escape(source: string | number | boolean | null): string;

  /**
   * Counts occurrences of each named capture group
   * @param source - RegExp or pattern source string
   * @returns Object mapping group names to occurrence counts
   * @example
   * RegXpChef.groupCounts(/(?<year>\d+)-(?<year>\d+)/)
   * // => { year: 2 }
   */
  static groupCounts(source: RegExp | string): Record<string, number> | undefined;

  /**
   * Gets names of matched groups from a match result
   * @param match - RegExp match result
   * @returns Array of group names that matched (not undefined)
   * @example
   * const match = 'a1'.match(/(?<letter>[a-z])(?<digit>\d)/)
   * RegXpChef.matchGroups(match)
   * // => ['letter', 'digit']
   */
  static matchGroups(match: RegExpMatchArray | null): string[] | undefined;
}

// CommonJS export
export = RegXpChef;

// ES Module export (if supporting both)
export as namespace RegXpChef;
export default RegXpChef;
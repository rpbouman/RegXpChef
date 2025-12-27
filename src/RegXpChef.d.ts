/**
 * Configuration object with $-prefixed directives
 */
interface RegXpChefConfig {
  /** Regex flags */
  $flags?: string;
  
  /** Begin pattern */
  $begin?: RegExp | string;
  
  /** Begin pattern as lookahead/lookbehind */
  $beginExclusive?: boolean;
  
  /** End pattern */
  $end?: RegExp | string;
  
  /** End pattern as lookahead/lookbehind */
  $endExclusive?: boolean;
  
  /** Content pattern */
  $content?: RegXpChefPattern | RegXpChefPattern[];
  
  /** Escape sequence */
  $escape?: RegExp | string;
  
  /** Minimum repetitions */
  $min?: number;
  
  /** Maximum repetitions */
  $max?: number | '∞';
}

/**
 * Token definitions (object with non-$-prefixed keys)
 */
type RegXpChefTokens = Record<string, RegXpChefPattern>;

/**
 * Valid pattern types
 */
type RegXpChefPattern = 
  | RegExp              // ← has .flags property naturally
  | string
  | RegXpChefConfig     // ← uses $flags directive
  | RegXpChefPattern[];

/**
 * Valid input types for assemble/compile
 */
type RegXpChefInput = 
  | RegExp              // ← Can pass RegExp directly!
  | RegXpChefConfig
  | RegXpChefTokens
  | RegXpChefPattern;
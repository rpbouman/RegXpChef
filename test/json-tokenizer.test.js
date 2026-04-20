const RegXpChef = require('../src/RegXpChef');

describe('json tokenizer', () => {

  test('tokenize json', () => {
    const obj = {
      str1: 'string value',
      str2: 'string value with "quotes" inside',
      str3: 'string value with \\ inside',
      intValue: 1,
      floatValue: 1.2,
      boolTrue: true,
      boolFalse: false,
      nullValue: null
    };
    const input = JSON.stringify(obj, null, 2);
    const expectedMatches = [
      {groups: {interpunction: '{'}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"str1"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {string: '"string value"'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"str2"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {string: '"string value with \\"quotes\\" inside"'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"str3"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {string: '"string value with \\\\ inside"'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"intValue"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {number: '1'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"floatValue"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {number: '1.2'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"boolTrue"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {keyword: 'true'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"boolFalse"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {keyword: 'false'}},
      {groups: {interpunction: ','}},
      {groups: {whitespace: '\n  '}},
      {groups: {key: '"nullValue"'}},
      {groups: {interpunction: ':'}},
      {groups: {whitespace: ' '}},
      {groups: {keyword: 'null'}},
      {groups: {whitespace: '\n'}},
      {groups: {interpunction: '}'}},
    ];
    
    const stringConfig = {
      $begin: '"',
      $end: '"',
      $escape: '\\'
    };
    
    const config = {
      keyword: {
        $begin: /\b/,
        $content: ['false', 'null', 'undefined', 'true'],
        $end: /\b/
      },
      interpunction: /[,:{}\[\]]/,
      number: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[Ee][+-]?\d+)?/,
      key: {
        $content: stringConfig,
        $end: /(?=\s*:)/,
      },
      string: stringConfig,
      whitespace: /\s+/
    };
    
    const regexp = RegXpChef.compile({$flags: 'g'}, config);
    const actualMatches = Array.from(input.matchAll(regexp)).map(match => {
      const groups = RegXpChef.matchGroups(match);
      const group = {};
      const groupName = groups[0];
      const value = match.groups[groupName];
      group[groupName] = value;
      return {groups: group};
    });
    
    expect(expectedMatches).toEqual(actualMatches);
  });

});

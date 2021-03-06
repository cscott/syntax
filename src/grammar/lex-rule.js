/**
 * The MIT License (MIT)
 * Copyright (c) 2015-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

/**
 * A lexical grammar rule.
 */
export default class LexRule {
  /**
   * Format of a rule is: `<matcher> : <tokenType>`.
   *
   * In the simplest case a terminal matches itself, and the
   * token is also the value of the terminal:
   *
   *   a : "a"
   *
   * In other regexp cases, the token can be a class of
   * tokens, like `NUMBER`:
   *
   *   [0-9]+(\.[0-9]+)? : NUMBER
   */
  constructor({matcher, tokenHandler}) {
    this._rawMatcher = `^${matcher}`;
    this._matcher = new RegExp(this._rawMatcher);
    this._rawHandler = tokenHandler;
    this._handler = this._buildHandler(tokenHandler);
  }

  getRawMatcher() {
    return this._rawMatcher;
  }

  getMatcher() {
    return this._matcher;
  }

  getRawHandler() {
    return this._rawHandler;
  }

  getTokenData(yytext) {
    return this._handler(yytext);
  }

  /**
   * Builds a wrapper function on top of the handler.
   * This is in order to be able directly modify `yytext`,
   * (which is closured), and return a token.
   */
  _buildHandler(tokenHandler) {
    let yytext, yyleng;
    let tokenFn;

    try {
      /* Generate the function handler only for JS language */
      tokenFn = eval(`(function() { ${tokenHandler} })`);
    } catch (e) {
      /* And skip for other languages, which use raw handler in generator */
    }
    return (_yytext) => {
      yytext = _yytext;
      yyleng = _yytext.length;
      let token = tokenFn();
      return [yytext, token];
    };
  }

  static matcherFromTerminal(terminal) {
    return terminal
      .slice(1, terminal.length - 1)
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
};

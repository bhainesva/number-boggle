import { children, ParentComponent } from 'solid-js'
import classNames from 'classnames';
import { Parser } from "expr-eval";

export const Tile: ParentComponent<{ color?: string }> = (props) => {
  const c = children(() => props.children);

  const cls = classNames("rounded py-1 px-1.5", props.color || "bg-slate-500")

  return (
    <span class={cls}>{c()}</span>
  )
}

export const Heading: ParentComponent<{class?: string}> = (props) => {
  const c = children(() => props.children);

  return (
    <h2 class={classNames("my-2 text-2xl font-bold", props.class)}>{c()}</h2>
  )
}

export function hash(n: any): number {
  return ((0x0000FFFF & n) << 16) + ((0xFFFF0000 & n) >> 16)
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function prexParseExpression(i: string) {
  return i;
}
// Makes implicit multiplication explicit.
// Copied from: https://github.com/silentmatt/expr-eval/issues/1#issuecomment-46501694
export function preParseExpression(expressionString: string, p: Parser) {
  expressionString = expressionString.toString();

  // Replace any function names in the expression with tokens, so they won't
  // confuse the replacements for implicit multiplication. (All the functions
  // and constants used by Parser can be found as properties in Parser.values.)
  const operators = Object.keys(p.functions);

  // Sort the function names by length so we replace 'asin' before 'sin'. (This
  // avoids breaking function names.)
  operators.sort(function(a, b){
    return b.length - a.length;
  });

  // Build an object with replacement rules. (The order matters!)
  const re: Record<string, {expr: RegExp, repl: string}> = {};

  // Replace function names with tokens. Include opening parenthesis of the function
  // argument, to avoid it being treated as an implicit multiplication.
  for (const i in operators) {
    re['op' + i] = {
      expr : new RegExp(operators[i] + '\\('),
      repl : '<' + i + '>',
    };
  }

  // Special case: The constant PI is understood by Parser, and should be replaced
  // to avoid treating the letters as an implicit multiplication.
  re.pi = {
    expr : /pi/i,
    repl : 'π',
  };

  // Replacements making implicit multiplication explicit:
  // a(x+1)(x+2) becomes a*(x+1)*(x+2). Most of this trick comes from
  // http://stackoverflow.com/questions/20912455/math-expression-parser
  // Cred to Reut Sharabani.
  re.implicit = {
    expr: /([0-9]+|[a-zπ\\)])(?=[a-zπ<\\(])/i,
    repl : '$1*',
  };
  // When implicit multiplications have been taken care of, we can return 'π' to 'PI'.
  re.piBack = {
    expr: /π/,
    repl : 'PI',
  };
  // Return any function names to the expression.
  for (const i in operators) {
    re['opBack' + i] = {
      expr : new RegExp('<' + i + '>'),
      repl : operators[i] + '(',
    };
  }

  // Apply the replacement rules.
  for (const i in re) {
    while (expressionString.replace(re[i].expr, re[i].repl) != expressionString) {
      expressionString = expressionString.replace(re[i].expr, re[i].repl);
    }
  }

  return expressionString;
}

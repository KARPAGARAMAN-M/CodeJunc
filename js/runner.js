/* ============================================================
   CodeJunc — runner.js
   Execution engine.
   · JavaScript: executes for real in an isolated Web Worker
     (sandboxed, timeout-protected), with an inline fallback.
   · C / C++ / Java / Python: a local demo runtime that mirrors
     the compile → run pipeline and interprets a practical
     beginner subset of each language (assignments, arithmetic,
     if/else, formatted printing, stdin consumption).
   A production sandbox will replace the demo runtime behind
   this exact interface.
   ============================================================ */
window.CJ = window.CJ || {};

(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------------------------------------------------
     Small utilities
     --------------------------------------------------------- */
  const isInt = (v) => typeof v === 'number' && Number.isInteger(v);

  const numType = (v) =>
    v === null || v === undefined
      ? 'none'
      : typeof v === 'number'
        ? Number.isInteger(v)
          ? 'integer'
          : 'float'
        : typeof v === 'boolean'
          ? 'boolean'
          : typeof v === 'string'
            ? 'string'
            : 'object';

  function fail(stage, message, line) {
    const e = new Error(message);
    e.stage = stage; // 'compile' | 'runtime'
    e.line = line || null;
    return e;
  }

  /* Strip comments while preserving character positions/newlines */
  function stripComments(code, lang) {
    const cfg =
      lang === 'python'
        ? { line: '#', block: null, triple: true }
        : { line: '//', block: ['/*', '*/'], triple: false };
    const n = code.length;
    let out = '';
    let i = 0;
    while (i < n) {
      const ch = code[i];
      if (cfg.line && code.startsWith(cfg.line, i) && lang !== 'javascript') {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        out += ' '.repeat(j - i);
        i = j;
        continue;
      }
      if (cfg.line && code.startsWith(cfg.line, i) && lang === 'javascript') {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        out += ' '.repeat(j - i);
        i = j;
        continue;
      }
      if (cfg.block && code.startsWith(cfg.block[0], i)) {
        let j = code.indexOf(cfg.block[1], i + cfg.block[0].length);
        j = j === -1 ? n : j + cfg.block[1].length;
        for (let k = i; k < j; k++) out += code[k] === '\n' ? '\n' : ' ';
        i = j;
        continue;
      }
      if (ch === '"' || ch === "'" || (lang === 'javascript' && ch === '`')) {
        // copy string verbatim (escapes included)
        let j = i + 1;
        while (j < n) {
          if (code[j] === '\\') j += 2;
          else if (code[j] === ch) {
            j++;
            break;
          } else if (code[j] === '\n') break;
          else j++;
        }
        out += code.slice(i, j);
        i = j;
        continue;
      }
      out += ch;
      i++;
    }
    return out;
  }

  /* Verify bracket balance + unterminated strings (string/comment aware) */
  function checkBalance(code, lang) {
    const cfg =
      lang === 'python'
        ? { line: '#', block: null }
        : { line: '//', block: ['/*', '*/'] };
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const stack = [];
    let i = 0;
    const n = code.length;
    while (i < n) {
      const ch = code[i];
      if (cfg.line && code.startsWith(cfg.line, i)) {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        i = j;
        continue;
      }
      if (cfg.block && code.startsWith(cfg.block[0], i)) {
        let j = code.indexOf(cfg.block[1], i + cfg.block[0].length);
        j = j === -1 ? n : j + cfg.block[1].length;
        i = j;
        continue;
      }
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        let closed = false;
        while (j < n) {
          if (code[j] === '\\') j += 2;
          else if (code[j] === ch) {
            closed = true;
            j++;
            break;
          } else if (code[j] === '\n') break;
          else j++;
        }
        if (!closed) {
          const line = code.slice(0, i).split('\n').length;
          return fail('compile', 'Unterminated string literal — a quote was opened but never closed.', line);
        }
        i = j;
        continue;
      }
      if (ch === '(' || ch === '[' || ch === '{') stack.push({ ch, i });
      else if (pairs[ch]) {
        const top = stack.pop();
        if (!top || top.ch !== pairs[ch]) {
          const line = code.slice(0, i).split('\n').length;
          return fail('compile', `Unexpected '${ch}' — brackets are mismatched.`, line);
        }
      }
      i++;
    }
    if (stack.length) {
      const top = stack[stack.length - 1];
      const line = code.slice(0, top.i).split('\n').length;
      return fail('compile', `Unmatched '${top.ch}' — this bracket is never closed.`, line);
    }
    return null;
  }

  function lineOf(code, snippet) {
    if (!snippet) return null;
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    const target = norm(snippet);
    if (!target) return null;
    const probe = target.slice(0, 40);
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (norm(lines[i]).includes(probe)) return i + 1;
    }
    return null;
  }

  function decodeEscapes(s) {
    return s
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\0/g, '\0')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }

  function splitTop(src, sep) {
    // split by top-level separator (sep = ',' or '<<' or '>>'), ignoring strings/parens
    const parts = [];
    let buf = '';
    let depth = 0;
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        let j = i + 1;
        while (j < n) {
          if (src[j] === '\\') j += 2;
          else if (src[j] === ch) {
            j++;
            break;
          } else j++;
        }
        buf += src.slice(i, j);
        i = j;
        continue;
      }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      if (ch === ')' || ch === ']' || ch === '}') depth--;
      if (depth === 0 && src.startsWith(sep, i)) {
        parts.push(buf);
        buf = '';
        i += sep.length;
        continue;
      }
      buf += ch;
      i++;
    }
    parts.push(buf);
    return parts.map((p) => p.trim()).filter((p) => p.length > 0);
  }

  function balanceOf(text) {
    let d = 0;
    let inStr = null;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (ch === '\\') i++;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'") inStr = ch;
      else if (ch === '(' || ch === '[' || ch === '{') d++;
      else if (ch === ')' || ch === ']' || ch === '}') d--;
    }
    return d;
  }

  /* ---------------------------------------------------------
     Value stringification per language
     --------------------------------------------------------- */
  const strVal = (v, lang) => {
    if (v === null || v === undefined) return lang === 'python' ? 'None' : lang === 'java' ? 'null' : 'null';
    if (typeof v === 'boolean') {
      if (lang === 'python') return v ? 'True' : 'False';
      if (lang === 'java') return v ? 'true' : 'false';
      return v ? '1' : '0';
    }
    if (typeof v === 'number') {
      if (lang === 'c' || lang === 'cpp') return isInt(v) ? String(v) : String(v);
      if (lang === 'java') return isInt(v) ? String(v) : String(v);
      return String(v);
    }
    if (typeof v === 'string') return v;
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  };

  /* ---------------------------------------------------------
     Expression tokenizer + evaluator
     --------------------------------------------------------- */
  function tokenizeExpr(src, lang) {
    const tokens = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      // numbers
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        const m = src.slice(i).match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/);
        if (!m) throw fail('runtime', `Malformed number near '${src.slice(i, i + 12)}'.`);
        const raw = m[1];
        tokens.push({
          t: 'num',
          v: raw.toLowerCase().startsWith('0x')
            ? parseInt(raw, 16)
            : raw.toLowerCase().startsWith('0b')
              ? parseInt(raw.slice(2), 2)
              : parseFloat(raw),
        });
        i += raw.length;
        continue;
      }
      // strings (with optional python prefix letters)
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        let raw = '';
        while (j < n) {
          if (src[j] === '\\') {
            raw += src[j] + (src[j + 1] || '');
            j += 2;
          } else if (src[j] === ch) break;
          else {
            raw += src[j];
            j++;
          }
        }
        tokens.push({ t: 'str', v: decodeEscapes(raw) });
        i = j + 1;
        continue;
      }
      // identifiers / dotted
      if (/[A-Za-z_]/.test(ch)) {
        const m = src.slice(i).match(/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/);
        const word = m[0];
        const lower = word.toLowerCase();
        if (lang === 'python') {
          if (word === 'True') tokens.push({ t: 'num', v: 1 });
          else if (word === 'False') tokens.push({ t: 'num', v: 0 });
          else if (word === 'None') tokens.push({ t: 'nil' });
          else if (word === 'and') tokens.push({ t: 'op', v: 'and' });
          else if (word === 'or') tokens.push({ t: 'op', v: 'or' });
          else if (word === 'not') tokens.push({ t: 'op', v: 'not' });
          else tokens.push({ t: 'id', v: word });
        } else {
          if (word === 'true') tokens.push({ t: 'num', v: 1 });
          else if (word === 'false') tokens.push({ t: 'num', v: 0 });
          else if (word === 'NULL' || word === 'nullptr') tokens.push({ t: 'nil' });
          else tokens.push({ t: 'id', v: word });
        }
        i += word.length;
        continue;
      }
      // multi-char operators
      const two = src.slice(i, i + 2);
      if (['**', '//', '==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
        tokens.push({ t: 'op', v: two });
        i += 2;
        continue;
      }
      if ('+-*/%<>!(),.'.includes(ch)) {
        tokens.push({ t: 'op', v: ch });
        i++;
        continue;
      }
      throw fail('runtime', `Unexpected character '${ch}' in expression.`);
    }
    return tokens;
  }

  function makeEvaluator(lang, env, io) {
    const PREC = {
      '||': 1,
      '&&': 2,
      '==': 3,
      '!=': 3,
      '<': 3,
      '<=': 3,
      '>': 3,
      '>=': 3,
      '+': 4,
      '-': 4,
      '*': 5,
      '/': 5,
      '//': 5,
      '%': 5,
      '**': 6,
      and: 1,
      or: 2,
    };

    function toNum(v, what) {
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'string') {
        const p = Number(v);
        if (Number.isNaN(p)) throw fail('runtime', `${what}: '${v}' cannot be used as a number.`);
        return p;
      }
      if (v === null || v === undefined)
        throw fail('runtime', `${what}: value is missing (variable used before assignment?).`);
      throw fail('runtime', `${what}: expected a number, got ${numType(v)}.`);
    }

    function truthy(v) {
      return v !== false && v !== null && v !== undefined && v !== 0 && v !== '' && !Number.isNaN(v);
    }

    function binop(op, a, b) {
      switch (op) {
        case '+':
          if (typeof a === 'string' || typeof b === 'string') {
            return strVal(a, lang) + strVal(b, lang);
          }
          return toNum(a, 'Addition') + toNum(b, 'Addition');
        case '-':
          return toNum(a, 'Subtraction') - toNum(b, 'Subtraction');
        case '*':
          if (typeof a === 'string' && isInt(b)) return a.repeat(Math.max(0, b));
          if (isInt(a) && typeof b === 'string') return b.repeat(Math.max(0, a));
          return toNum(a, 'Multiplication') * toNum(b, 'Multiplication');
        case '/': {
          const x = toNum(a, 'Division');
          const y = toNum(b, 'Division');
          if (y === 0) {
            const bothInt = isInt(x) && isInt(y);
            if (bothInt && lang !== 'python') {
              throw fail(
                'runtime',
                lang === 'java'
                  ? 'ArithmeticException: / by zero'
                  : 'Floating point exception (core dumped)'
              );
            }
            if (lang === 'python') throw fail('runtime', 'ZeroDivisionError: division by zero');
          }
          if (bothIntLike(x, y) && lang !== 'python' && y !== 0) return Math.trunc(x / y);
          return x / y;
        }
        case '//': {
          const x = toNum(a, 'Division');
          const y = toNum(b, 'Division');
          if (y === 0) throw fail('runtime', 'ZeroDivisionError: integer division or modulo by zero');
          return Math.floor(x / y);
        }
        case '%': {
          const x = toNum(a, 'Modulo');
          const y = toNum(b, 'Modulo');
          if (y === 0) {
            if (lang === 'python') throw fail('runtime', 'ZeroDivisionError: integer modulo');
            if (lang === 'java') throw fail('runtime', 'ArithmeticException: / by zero');
            throw fail('runtime', 'Floating point exception (core dumped)');
          }
          if (lang === 'python') return ((x % y) + y) % y;
          return x % y;
        }
        case '**': {
          const x = toNum(a, 'Exponentiation');
          const y = toNum(b, 'Exponentiation');
          const r = Math.pow(x, y);
          if (Number.isNaN(r)) throw fail('runtime', 'Math domain error.');
          return r;
        }
        case '==':
          return looseEq(a, b);
        case '!=':
          return !looseEq(a, b);
        case '<':
          return cmp(a, b) < 0;
        case '<=':
          return cmp(a, b) <= 0;
        case '>':
          return cmp(a, b) > 0;
        case '>=':
          return cmp(a, b) >= 0;
        case '&&':
          return truthy(a) && truthy(b);
        case '||':
          return truthy(a) || truthy(b);
        case 'and':
          return truthy(a) && truthy(b);
        case 'or':
          return truthy(a) || truthy(b);
        default:
          throw fail('runtime', `Unsupported operator '${op}'.`);
      }
    }

    const bothIntLike = (x, y) => isInt(x) && isInt(y);

    function looseEq(a, b) {
      if (typeof a === 'string' || typeof b === 'string') {
        if (typeof a === 'string' && typeof b === 'string') return a === b;
        return strVal(a, lang) === strVal(b, lang);
      }
      return a === b || (Number.isNaN(a) && Number.isNaN(b));
    }

    function cmp(a, b) {
      if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
      return toNum(a, 'Comparison') - toNum(b, 'Comparison');
    }

    function callFn(name, args) {
      if (name === 'input') {
        if (io && io.readLine) {
          const msg = args.length ? strVal(args[0], lang) : '';
          if (msg) io.push(msg);
          return io.readLine();
        }
        throw fail('runtime', 'input() is not available in this runtime.');
      }
      const nums = args.map((a) => toNum(a, `${name}()`));
      switch (name) {
        case 'sqrt':
          if (nums[0] < 0) throw fail('runtime', 'Math domain error: sqrt of a negative number.');
          return Math.sqrt(nums[0]);
        case 'abs':
          return Math.abs(nums[0]);
        case 'floor':
          return Math.floor(nums[0]);
        case 'ceil':
          return Math.ceil(nums[0]);
        case 'round':
          return args.length > 1
            ? Number(nums[0].toFixed(Math.trunc(nums[1])))
            : Math.round(nums[0]);
        case 'min':
          return Math.min(...nums);
        case 'max':
          return Math.max(...nums);
        case 'pow':
          return Math.pow(nums[0], nums[1]);
        case 'len':
          if (typeof args[0] === 'string') return args[0].length;
          throw fail('runtime', 'len(): unsupported argument.');
        case 'int':
          if (typeof args[0] === 'string') {
            const p = parseInt(args[0], 10);
            if (Number.isNaN(p)) throw fail('runtime', `ValueError: invalid literal '${args[0]}' for int().`);
            return p;
          }
          return Math.trunc(nums[0]);
        case 'float':
          if (typeof args[0] === 'string') {
            const p = parseFloat(args[0]);
            if (Number.isNaN(p)) throw fail('runtime', `ValueError: invalid literal '${args[0]}' for float().`);
            return p;
          }
          return nums[0];
        case 'str':
          return strVal(args[0], lang);
        case 'Math.sqrt':
        case 'Math.abs':
        case 'Math.floor':
        case 'Math.ceil':
        case 'Math.round':
        case 'Math.pow':
        case 'Math.max':
        case 'Math.min': {
          const short = name.split('.')[1];
          return callFn(short, args);
        }
        case 'Double.parseDouble':
        case 'Integer.parseInt': {
          const p = parseFloat(args[0]);
          if (Number.isNaN(p)) throw fail('runtime', `NumberFormatException: '${args[0]}'.`);
          return p;
        }
        default:
          throw fail('compile', `'${name}' is not a recognised function in the demo runtime.`);
      }
    }

    function evalSrc(src) {
      const tokens = tokenizeExpr(src, lang);
      let pos = 0;
      const peek = () => tokens[pos];
      const next = () => tokens[pos++];

      function parsePrimary() {
        const tk = next();
        if (!tk) throw fail('runtime', 'Expression ended unexpectedly.');
        if (tk.t === 'num') return tk.v;
        if (tk.t === 'str') return tk.v;
        if (tk.t === 'nil') return null;
        if (tk.t === 'id') {
          if (peek() && peek().t === 'op' && peek().v === '(') {
            next(); // (
            const args = [];
            if (!(peek() && peek().t === 'op' && peek().v === ')')) {
              do {
                args.push(parseExpr(0));
              } while (peek() && peek().t === 'op' && peek().v === ',' && next());
            }
            const close = next();
            if (!close || close.v !== ')') throw fail('compile', `Missing ')' after arguments to '${tk.v}'.`);
            return callFn(tk.v, args);
          }
          if (Object.prototype.hasOwnProperty.call(env, tk.v)) return env[tk.v];
          throw fail(
            lang === 'python' ? 'runtime' : 'compile',
            lang === 'python'
              ? `NameError: name '${tk.v}' is not defined`
              : `'${tk.v}' was not declared in this scope.`,
            null
          );
        }
        if (tk.t === 'op' && tk.v === '(') {
          const v = parseExpr(0);
          const close = next();
          if (!close || close.v !== ')') throw fail('compile', "Missing ')'.");
          return v;
        }
        if (tk.t === 'op' && tk.v === '-') return -toNum(parseUnaryOperand(), 'Negation');
        if (tk.t === 'op' && tk.v === '!') return !truthy(parseUnaryOperand());
        if (tk.t === 'op' && tk.v === 'not') return !truthy(parseUnaryOperand());
        throw fail('runtime', `Unexpected token '${tk.v ?? tk.t}' in expression.`);
      }

      function parseUnaryOperand() {
        const tk = peek();
        if (tk && tk.t === 'op' && tk.v === '-') {
          next();
          return -toNum(parsePrimary(), 'Negation');
        }
        if (tk && tk.t === 'op' && (tk.v === '!' || tk.v === 'not')) {
          next();
          return !truthy(parsePrimary());
        }
        return parsePrimary();
      }

      function parseExpr(minPrec) {
        let left = parsePrimary();
        // power is right-associative
        while (peek() && peek().t === 'op' && peek().v === '**') {
          next();
          const right = parseExpr(PREC['**'] - 1); // right assoc
          left = binop('**', left, right);
        }
        while (peek() && peek().t === 'op' && PREC[peek().v] !== undefined && PREC[peek().v] >= minPrec) {
          const op = next().v;
          const right = parseExpr(PREC[op] + 1);
          left = binop(op, left, right);
        }
        return left;
      }

      const result = parseExpr(0);
      if (pos < tokens.length) {
        throw fail('runtime', `Unexpected token '${tokens[pos].v ?? tokens[pos].t}' after expression.`);
      }
      return result;
    }

    return evalSrc;
  }

  /* ---------------------------------------------------------
     Context + stdin helpers
     --------------------------------------------------------- */
  function makeCtx(stdin) {
    let rawLines = stdin.split(/\r?\n/);
    if (rawLines.length && rawLines[rawLines.length - 1] === '') rawLines.pop();
    return {
      out: [],
      notes: [],
      ended: false,
      env: {},
      rawLines,
      lineIdx: 0,
      _tokens: null,
    };
  }

  function nextToken(ctx) {
    if (ctx._tokens === null) {
      ctx._tokens = ctx.rawLines
        .join('\n')
        .split(/\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return ctx._tokens.length ? ctx._tokens.shift() : undefined;
  }

  function nextLine(ctx) {
    if (ctx.lineIdx < ctx.rawLines.length) return ctx.rawLines[ctx.lineIdx++];
    throw fail('runtime', 'EOFError: stdin has no more lines to read.');
  }

  /* ---------------------------------------------------------
     C / C++ / Java statement parsing & execution
     --------------------------------------------------------- */
  /* index just after the closing quote of the string starting at i */
  function skipString(src, i) {
    const q = src[i];
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === '\\') j += 2;
      else if (src[j] === q) return j + 1;
      else j++;
    }
    return j;
  }

  function readMatching(src, start, openCh, closeCh) {
    let depth = 0;
    for (let i = start; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' || ch === "'") {
        i = skipString(src, i) - 1;
        continue;
      }
      if (ch === openCh) depth++;
      else if (ch === closeCh) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function parseUnits(src) {
    const units = [];
    let buf = '';
    let parenDepth = 0;
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === '"' || ch === "'") {
        const j = skipString(src, i);
        buf += src.slice(i, j);
        i = j;
        continue;
      }
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
      if (ch === '{') {
        const header = buf.trim();
        buf = '';
        const end = readMatching(src, i, '{', '}');
        if (end === -1) {
          const t = header;
          if (t) units.push({ type: 'stmt', text: t });
          break;
        }
        units.push({ type: 'block', header, children: parseUnits(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
      if (ch === '}') {
        i++;
        continue;
      }
      if (ch === ';' && parenDepth === 0) {
        buf += ch;
        const t = buf.trim();
        if (t) units.push({ type: 'stmt', text: t });
        buf = '';
        i++;
        continue;
      }
      buf += ch;
      i++;
    }
    const t = buf.trim();
    if (t) units.push({ type: 'stmt', text: t });
    return units;
  }

  const IGNORE_STMT = /^(using|import|package|namespace|extern|typedef|template|public|private|protected|static|synchronized|final|abstract|class|struct|enum|interface|try|catch|finally|new|delete|goto|typedef)\b/;

  function isFunctionDef(header) {
    if (/^(if|for|while|switch|catch|else|do)\b/.test(header)) return false;
    if (/\b(main|class|struct|union|namespace|try)\b/.test(header)) return false;
    return header.includes('(');
  }

  const TYPE_RE =
    /^((?:(?:const|final|static|volatile|unsigned|signed|long|short|register)\s+)*(?:int|float|double|char|bool|boolean|String|auto|var|string|let|Integer|Long|Double|Float|short|byte))\s+(.+)$/;

  function execCFamily(lang, code, ctx, onPhase) {
    const cleaned = stripComments(code, lang);
    const units = parseUnits(cleaned);
    execList(lang, units, ctx, code);
    return ctx;
  }

  function execList(lang, units, ctx, code) {
    for (let idx = 0; idx < units.length; idx++) {
      if (ctx.ended) return;
      const u = units[idx];
      if (u.type === 'block') {
        const h = u.header.trim();
        if (/^if\b/.test(h)) {
          idx = execIf(lang, units, idx, ctx, code);
          continue;
        }
        if (/^(for|while)\b/.test(h)) {
          ctx.notes.push('Loop blocks were skipped by the demo runtime.');
          continue;
        }
        if (/^switch\b/.test(h)) {
          ctx.notes.push('switch statements were skipped by the demo runtime.');
          continue;
        }
        if (/^(class|struct|union|namespace|try|else)\b/.test(h) || h === '') {
          execList(lang, u.children, ctx, code);
          continue;
        }
        if (isFunctionDef(h)) {
          // function definition — skip body
          continue;
        }
        execList(lang, u.children, ctx, code);
        continue;
      }
      execStmt(lang, u.text, ctx, code);
    }
  }

  function execIf(lang, units, idx, ctx, code) {
    const ifUnit = units[idx];
    const condVal = evalExpr(lang, extractParen(ifUnit.header), ctx, code);
    let nextIdx = idx + 1;
    let executed = false;
    if (truthyVal(condVal)) {
      execList(lang, ifUnit.children, ctx, code);
      executed = true;
    }
    // walk the else-if / else chain that follows
    while (
      nextIdx < units.length &&
      units[nextIdx].type === 'block' &&
      /^else\b/.test(units[nextIdx].header.trim())
    ) {
      const u = units[nextIdx];
      const h = u.header.trim();
      nextIdx++;
      if (!executed && /^else\s+if\b/.test(h)) {
        const v = evalExpr(lang, extractParen(h), ctx, code);
        if (truthyVal(v)) {
          execList(lang, u.children, ctx, code);
          executed = true;
        }
      } else if (!executed) {
        execList(lang, u.children, ctx, code);
        executed = true;
      }
    }
    return nextIdx - 1;
  }

  function extractParen(header) {
    const a = header.indexOf('(');
    const b = header.lastIndexOf(')');
    if (a === -1 || b === -1 || b < a) return '1';
    return header.slice(a + 1, b);
  }

  const truthyVal = (v) => v !== false && v !== null && v !== undefined && v !== 0 && v !== '' && !Number.isNaN(v);

  function evalExpr(lang, src, ctx, code) {
    const io =
      lang === 'python'
        ? {
            push: (s) => ctx.out.push(s),
            readLine: () => nextLine(ctx),
          }
        : null;
    const ev = makeEvaluator(lang, ctx.env, io);
    try {
      return ev(src);
    } catch (e) {
      if (e && e.stage) {
        if (!e.line) e.line = lineOf(code, src);
        throw e;
      }
      throw fail('runtime', e.message || String(e));
    }
  }

  function execStmt(lang, stmtRaw, ctx, code) {
    if (ctx.ended) return;
    const stmt = stmtRaw.trim().replace(/;$/, '').trim();
    if (!stmt) return;

    // preprocessor / macros
    let m = stmt.match(/^#define\s+([A-Za-z_]\w*)\s+(.+)$/);
    if (m) {
      try {
        ctx.env[m[1]] = evalExpr(lang, m[2], ctx, code);
      } catch (e) {
        // macro not evaluable — store raw text
        ctx.env[m[1]] = m[2];
      }
      return;
    }
    if (stmt.startsWith('#')) return;

    if (IGNORE_STMT.test(stmt)) return;
    if (/=\s*new\s+[A-Za-z_]/.test(stmt)) return; // Scanner sc = new Scanner(...)
    if (/^return\b/.test(stmt)) {
      ctx.ended = true;
      return;
    }
    if (/^(break|continue)\b/.test(stmt)) return;

    /* ---- Java: System.out.print / println ---- */
    m = stmt.match(/^System\.out\.(println|print)\s*\((.*)\)\s*;?$/);
    if (m) {
      const parts = m[2] ? splitTop(m[2], ',') : [];
      let s = '';
      for (const p of parts) s += strVal(evalExpr(lang, p, ctx, code), lang);
      ctx.out.push(s + (m[1] === 'println' ? '\n' : ''));
      return;
    }

    /* ---- Java: Scanner reads ---- */
    m = stmt.match(/^(?:int|double|float|long|short|String|boolean|char)\s+([A-Za-z_]\w*)\s*=\s*sc\.(nextInt|nextDouble|nextFloat|nextLong|nextShort|nextBoolean|next|nextLine)\(\)\s*;?$/);
    if (m) {
      const name = m[1];
      const kind = m[2];
      if (kind === 'nextLine') {
        try {
          ctx.env[name] = nextLine(ctx);
        } catch (e) {
          throw e;
        }
      } else {
        const tok = nextToken(ctx);
        if (tok === undefined) throw fail('runtime', 'NoSuchElementException: stdin is exhausted.', lineOf(code, stmt));
        if (/^(nextInt|nextLong|nextShort)$/.test(kind)) ctx.env[name] = parseInt(tok, 10) || 0;
        else if (/^(nextDouble|nextFloat)$/.test(kind)) ctx.env[name] = parseFloat(tok) || 0;
        else if (kind === 'nextBoolean') ctx.env[name] = tok === 'true' ? 1 : 0;
        else ctx.env[name] = tok;
      }
      return;
    }

    /* ---- C: printf / puts / putchar ---- */
    m = stmt.match(/^(?:std\s*::\s*)?(printf|puts|putchar)\s*\((.*)\)\s*;?$/);
    if (m) {
      const fn = m[1];
      const inner = m[2];
      if (fn === 'puts') {
        const parts = splitTop(inner, ',');
        ctx.out.push(strVal(evalExpr(lang, parts[0], ctx, code), lang) + '\n');
        return;
      }
      if (fn === 'putchar') {
        const parts = splitTop(inner, ',');
        const v = evalExpr(lang, parts[0], ctx, code);
        ctx.out.push(typeof v === 'string' ? v : String.fromCharCode(Number(v) || 0));
        return;
      }
      // printf
      const fm = inner.match(/^("(?:[^"\\]|\\.)*")\s*(?:,\s*(.*))?$/);
      if (!fm) {
        // dynamic format string — just print pieces
        const parts = splitTop(inner, ',');
        for (const p of parts) ctx.out.push(strVal(evalExpr(lang, p, ctx, code), lang));
        return;
      }
      const fmt = decodeEscapes(fm[1].slice(1, -1));
      const args = fm[2] ? splitTop(fm[2], ',').map((a) => evalExpr(lang, a, ctx, code)) : [];
      ctx.out.push(applyFormat(lang, fmt, args, code, stmt));
      return;
    }

    /* ---- C: scanf ---- */
    m = stmt.match(/^scanf\s*\((.*)\)\s*;?$/);
    if (m) {
      const inner = m[1];
      const fm = inner.match(/^("(?:[^"\\]|\\.)*")\s*(?:,\s*(.*))?$/);
      if (!fm) return;
      const fmt = decodeEscapes(fm[1].slice(1, -1));
      const names = (fm[2] || '')
        .split(',')
        .map((s) => s.replace(/&/g, '').replace(/\[.*?\]/g, '').trim())
        .filter(Boolean);
      let ni = 0;
      for (let i = 0; i < fmt.length && ni < names.length; i++) {
        if (fmt[i] !== '%') continue;
        if (fmt[i + 1] === '%') {
          i++;
          continue;
        }
        const mm = fmt.slice(i).match(/^%(\d+)?([diufegcsx])/);
        if (!mm) continue;
        i += mm[0].length - 1;
        const tok = nextToken(ctx);
        if (tok === undefined)
          throw fail('runtime', 'scanf: expected input on stdin but none remains.', lineOf(code, stmt));
        const spec = mm[2];
        const name = names[ni++];
        if ('diux'.includes(spec)) ctx.env[name] = parseInt(tok, spec === 'x' ? 16 : 10) || 0;
        else if ('feg'.includes(spec)) ctx.env[name] = parseFloat(tok) || 0;
        else if (spec === 'c') ctx.env[name] = tok.charAt(0);
        else ctx.env[name] = tok;
      }
      return;
    }

    /* ---- C++: cout / cin ---- */
    m = stmt.match(/^(?:std\s*::\s*)?cout\s*(<<.*)$/);
    if (m) {
      const parts = splitTop(m[1].replace(/^<</, '').trim(), '<<');
      let s = '';
      for (const p of parts) {
        if (/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/.test(p)) s += decodeEscapes(p.slice(1, -1));
        else if (/^std::endl$/.test(p) || p === 'endl') s += '\n';
        else s += strVal(evalExpr(lang, p, ctx, code), lang);
      }
      ctx.out.push(s);
      return;
    }
    m = stmt.match(/^(?:std\s*::\s*)?cin\s*(>>.*)$/);
    if (m) {
      const parts = splitTop(m[1].replace(/^>>/, '').trim(), '>>');
      for (const p of parts) {
        const name = p.trim();
        if (!/^[A-Za-z_]\w*$/.test(name)) continue;
        const tok = nextToken(ctx);
        if (tok === undefined)
          throw fail('runtime', 'cin: expected input on stdin but none remains.', lineOf(code, stmt));
        ctx.env[name] = /^-?\d+$/.test(tok) ? parseInt(tok, 10) : parseFloat(tok) || tok;
      }
      return;
    }

    // bare calls / unsupported statements are ignored
    if (/^[A-Za-z_][\w.]*\s*\(.*\)$/.test(stmt)) return;

    /* ---- assignments ---- */
    // multi-declaration: int a = 1, b = 2;
    m = stmt.match(TYPE_RE);
    if (m) {
      const typeName = m[1];
      const rest = m[2].trim();
      const store = (name, value) => {
        ctx.env[name] = /\b(bool|boolean)\b/.test(typeName) ? truthyVal(value) : value;
      };
      if (/^[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*$/.test(rest)) {
        // pure declaration: int a, b;
        for (const nm of rest.split(',')) store(nm.trim(), undefined);
        return;
      }
      // split by top-level commas into fragments and process each
      const frags = splitTop(rest, ',');
      for (const f of frags) {
        const fm2 = f.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
        if (fm2) store(fm2[1], evalExpr(lang, fm2[2], ctx, code));
        else {
          const raw = f.trim();
          const nm = raw.replace(/=$/, '').trim();
          if (/^[A-Za-z_]\w*$/.test(nm)) {
            if (raw.endsWith('='))
              throw fail('compile', `Expected an expression after '='.`, lineOf(code, stmt));
            store(nm, undefined);
          }
        }
      }
      return;
    }

    // reassignment / compound assignment
    m = stmt.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=|=)(.+)$/);
    if (m) {
      const name = m[1];
      const op = m[2];
      const rhs = m[3];
      if (op === '=' && /^[=<>!]/.test(rhs)) return; // comparison / logical statement
      if (op === '=') {
        ctx.env[name] = evalExpr(lang, rhs, ctx, code);
      } else {
        const cur = ctx.env[name];
        if (cur === undefined)
          throw fail('runtime', `'${name}' is used before being assigned.`, lineOf(code, stmt));
        const v = evalExpr(lang, rhs, ctx, code);
        if (op === '+=') ctx.env[name] = typeof cur === 'string' || typeof v === 'string' ? strVal(cur, lang) + strVal(v, lang) : Number(cur) + Number(v);
        else if (op === '-=') ctx.env[name] = Number(cur) - Number(v);
        else if (op === '*=') ctx.env[name] = Number(cur) * Number(v);
        else if (op === '/=') ctx.env[name] = Number(cur) / Number(v);
        else if (op === '%=') ctx.env[name] = Number(cur) % Number(v);
      }
      return;
    }
  }

  function applyFormat(lang, fmt, args, code, stmt) {
    let out = '';
    let ai = 0;
    for (let i = 0; i < fmt.length; i++) {
      const ch = fmt[i];
      if (ch !== '%') {
        out += ch;
        continue;
      }
      if (fmt[i + 1] === '%') {
        out += '%';
        i++;
        continue;
      }
      const m = fmt.slice(i).match(/^%(-)?(\d+)?(?:\.(\d+))?([diuoxXfFeEgGcs])/);
      if (!m) {
        out += '%';
        continue;
      }
      i += m[0].length - 1;
      const leftAlign = !!m[1];
      const width = m[2] ? parseInt(m[2], 10) : 0;
      const prec = m[3] !== undefined ? parseInt(m[3], 10) : null;
      const spec = m[4];
      const val = args[ai++];
      let s = '';
      if ('diuoxX'.includes(spec)) {
        let num = typeof val === 'number' ? Math.trunc(val) : parseInt(strVal(val, lang), 10) || 0;
        const neg = num < 0;
        let abs = Math.abs(num).toString(spec === 'o' ? 8 : spec === 'x' || spec === 'X' ? 16 : 10);
        if (spec === 'X') abs = abs.toUpperCase();
        if (neg) abs = '-' + abs;
        if (prec !== null && abs.replace('-', '').length < prec)
          abs = (neg ? '-' : '') + abs.replace('-', '').padStart(prec, '0');
        s = abs;
      } else if ('fFeEgG'.includes(spec)) {
        const num = typeof val === 'number' ? val : parseFloat(strVal(val, lang)) || 0;
        s = prec !== null ? num.toFixed(prec) : num.toFixed(6);
      } else if (spec === 'c') {
        s = typeof val === 'string' ? val.charAt(0) : String.fromCharCode(Math.trunc(Number(val)) || 0);
      } else if (spec === 's') {
        s = strVal(val, lang);
        if (prec !== null) s = s.slice(0, prec);
      }
      if (width && s.length < width) {
        s = leftAlign ? s.padEnd(width, ' ') : s.padStart(width, ' ');
      }
      out += s;
    }
    return out;
  }

  /* ---------------------------------------------------------
     Python statement execution
     --------------------------------------------------------- */
  function execPython(lang, code, ctx) {
    ctx.env['__name__'] = '__main__';
    const cleaned = stripComments(code, 'python');
    const merged = [];
    for (const raw of cleaned.split('\n')) {
      const indent = raw.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
      const text = raw.trim();
      if (!text) continue;
      const prev = merged[merged.length - 1];
      if (prev && balanceOf(prev.text) > 0) {
        prev.text += ' ' + text;
        continue;
      }
      merged.push({ indent, text });
    }
    runPythonLines(merged, ctx, code, 0, merged.length, merged[0] ? merged[0].indent : 0);
    return ctx;
  }

  function runPythonLines(lines, ctx, code, from, to, indent) {
    let i = from;
    while (i < to) {
      if (ctx.ended) return;
      const L = lines[i];
      if (!L || L.indent < indent) {
        i++;
        continue;
      }
      const t = L.text;
      let m;
      if ((m = t.match(/^if\s+(.+):$/))) {
        i = pythonIfChain(lines, ctx, code, i, to);
        continue;
      }
      if (/^(for|while)\b/.test(t)) {
        let j = i + 1;
        while (j < to && lines[j] && lines[j].indent > L.indent) j++;
        ctx.notes.push('Loop blocks were skipped by the demo runtime.');
        i = j;
        continue;
      }
      if (/^def\s+/.test(t)) {
        let j = i + 1;
        while (j < to && lines[j] && lines[j].indent > L.indent) j++;
        ctx.notes.push('User-defined functions are not executed by the demo runtime.');
        i = j;
        continue;
      }
      if (/^(import|from|pass|elif|else)\b/.test(t)) {
        i++;
        continue;
      }
      if (/^return\b/.test(t)) {
        ctx.ended = true;
        return;
      }
      if (t === 'break' || t === 'continue') {
        i++;
        continue;
      }
      execPythonStmt(t, ctx, code);
      i++;
    }
  }

  function pythonIfChain(lines, ctx, code, i, to) {
    const baseIndent = lines[i].indent;
    const segs = [];
    let j = i;
    while (j < to) {
      const L = lines[j];
      if (!L || L.indent !== baseIndent) break;
      const t = L.text;
      const mIf = t.match(/^if\s+(.+):$/);
      const mElseIf = t.match(/^else\s+if\s+(.+):$/);
      const mElse = t.match(/^else\s*:$/);
      if (!mIf && !mElseIf && !mElse) break;
      const cond = mElse ? null : mIf ? mIf[1] : mElseIf[1];
      let k = j + 1;
      const blk = [];
      while (k < to && lines[k] && lines[k].indent > baseIndent) {
        blk.push(lines[k]);
        k++;
      }
      segs.push({ cond, blk });
      j = k;
      if (mElse) break;
    }
    for (const seg of segs) {
      if (seg.cond === null) {
        runPythonLines(seg.blk, ctx, code, 0, seg.blk.length, seg.blk[0] ? seg.blk[0].indent : 0);
        return j;
      }
      try {
        if (truthyVal(evalExpr('python', seg.cond, ctx, code))) {
          runPythonLines(seg.blk, ctx, code, 0, seg.blk.length, seg.blk[0] ? seg.blk[0].indent : 0);
          return j;
        }
      } catch (e) {
        if (e && e.stage === 'compile') throw e;
        throw e;
      }
    }
    return j;
  }

  function execPythonStmt(t, ctx, code) {
    // print(...)
    let m = t.match(/^print\s*\((.*)\)\s*$/);
    if (m) {
      let inner = m[1].trim();
      if (!inner) {
        ctx.out.push('\n');
        return;
      }
      // strip trailing kwargs end=..., sep=..., file=...
      const kw = {};
      inner = inner.replace(/,\s*(sep|end|file)\s*=\s*("[^"]*"|'[^']*'|\S+)\s*$/, (_, k, v) => {
        kw[k] = v.replace(/^["']|["']$/g, '');
        return '';
      });
      const parts = splitTop(inner, ',');
      const sep = kw.sep !== undefined ? kw.sep : ' ';
      const end = kw.end !== undefined ? kw.end : '\n';
      let s = '';
      for (let i = 0; i < parts.length; i++) {
        if (i) s += sep;
        s += strVal(evalExpr('python', parts[i], ctx, code), 'python');
      }
      ctx.out.push(s + end);
      return;
    }

    // incomplete assignments → syntax error
    if (/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/\/=|\/=|%=|\*\*=|=)$/.test(t))
      throw fail('compile', 'SyntaxError: incomplete statement — expected a value after the operator.', lineOf(code, t));

    // assignments
    m = t.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/\/=|\/=|%=|\*\*=|=)(.+)$/);
    if (m) {
      const name = m[1];
      const op = m[2];
      const rhs = m[3];
      if (op === '=') {
        ctx.env[name] = evalExpr('python', rhs, ctx, code);
      } else {
        const cur = ctx.env[name];
        const v = evalExpr('python', rhs, ctx, code);
        if (cur === undefined && op !== '=') {
          throw fail('runtime', `NameError: name '${name}' is not defined`, lineOf(code, t));
        }
        if (op === '+=') ctx.env[name] = typeof cur === 'string' || typeof v === 'string' ? strVal(cur, 'python') + strVal(v, 'python') : Number(cur) + Number(v);
        else if (op === '-=') ctx.env[name] = Number(cur) - Number(v);
        else if (op === '*=') ctx.env[name] = typeof cur === 'string' && Number.isInteger(Number(v)) ? cur.repeat(Number(v)) : Number(cur) * Number(v);
        else if (op === '/=') ctx.env[name] = Number(cur) / Number(v);
        else if (op === '//=') ctx.env[name] = Math.floor(Number(cur) / Number(v));
        else if (op === '%=') ctx.env[name] = ((Number(cur) % Number(v)) + Number(v)) % Number(v);
        else if (op === '**=') ctx.env[name] = Math.pow(Number(cur), Number(v));
      }
      return;
    }

    // anything else: try as expression (e.g., function calls) — unsupported forms ignored
    if (/^[A-Za-z_][\w.]*\s*\(.*\)\s*$/.test(t)) return;
    if (/^[A-Za-z_]\w*$/.test(t)) return;
    // unknown → attempt evaluation to surface meaningful errors
    try {
      evalExpr('python', t, ctx, code);
    } catch (e) {
      if (e && e.stage) throw e;
      throw fail('runtime', `SyntaxError: cannot interpret '${t.slice(0, 40)}' in the demo runtime.`, lineOf(code, t));
    }
  }

  /* ---------------------------------------------------------
     JavaScript — real execution in a Worker (with fallback)
     --------------------------------------------------------- */
  const WORKER_SRC = function () {
    let rawLines = __STDIN__.split(/\r?\n/);
    if (rawLines.length && rawLines[rawLines.length - 1] === '') rawLines.pop();
    let lineIdx = 0;
    const fmt = (v) => {
      if (typeof v === 'string') return v;
      if (v === undefined) return 'undefined';
      if (v === null) return 'null';
      if (typeof v === 'number') return String(v);
      if (typeof v === 'boolean') return String(v);
      if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
      if (typeof v === 'symbol') return String(v);
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    };
    const push = (s) => self.postMessage({ t: 'log', s: s });
    const readLine = () => {
      if (lineIdx >= rawLines.length) throw new Error('EOFError: stdin has no more lines to read.');
      return rawLines[lineIdx++];
    };
    const inputFn = (msg) => {
      if (msg != null && String(msg).length) self.postMessage({ t: 'prompt', s: String(msg) });
      const v = readLine();
      self.postMessage({ t: 'echo', s: v + '\n' }); // terminal-style echo of consumed input
      return v;
    };
    const console = {
      log: (...a) => push(a.map(fmt).join(' ')),
      info: (...a) => push(a.map(fmt).join(' ')),
      debug: (...a) => push(a.map(fmt).join(' ')),
      warn: (...a) => push(a.map(fmt).join(' ')),
      error: (...a) => push(a.map(fmt).join(' ')),
      table: (v) => push(fmt(v)),
      trace: () => push(new Error('trace').stack || ''),
    };
    self.onmessage = (ev) => {
      const code = ev.data;
      try {
        const fn = new Function('input', 'readline', 'prompt', 'console', '__stdout__push', code);
        fn(inputFn, readLine, inputFn, console, push);
        self.postMessage({ t: 'done' });
      } catch (e) {
        self.postMessage({ t: 'error', message: (e && e.message) || String(e), name: (e && e.name) || 'Error' });
      }
    };
  };

  function runJSWorker(code, stdin, timeoutMs) {
    return new Promise((resolve) => {
      let worker;
      try {
        const src = WORKER_SRC.toString().replace('__STDIN__', JSON.stringify(stdin));
        const blob = new Blob(['(', src, ')()'], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
      } catch (e) {
        resolve(null);
        return;
      }
      const chunks = [];
      const timer = setTimeout(() => {
        worker.terminate();
        resolve({
          timedOut: true,
          chunks,
        });
      }, timeoutMs);
      worker.onmessage = (ev) => {
        const d = ev.data;
        if (d.t === 'log' || d.t === 'prompt' || d.t === 'echo') chunks.push(d);
        else if (d.t === 'done') {
          clearTimeout(timer);
          worker.terminate();
          resolve({ timedOut: false, chunks, error: null });
        } else if (d.t === 'error') {
          clearTimeout(timer);
          worker.terminate();
          resolve({ timedOut: false, chunks, error: { name: d.name, message: d.message } });
        }
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        worker.terminate();
        resolve({ timedOut: false, chunks, error: { name: 'Error', message: e.message || 'Worker error' } });
      };
      try {
        worker.postMessage(code);
      } catch (e) {
        clearTimeout(timer);
        worker.terminate();
        resolve({ timedOut: false, chunks, error: { name: 'Error', message: e.message } });
      }
    });
  }

  function runJSInline(code, stdin) {
    const chunks = [];
    const rawLines = stdin.split(/\r?\n/);
    if (rawLines.length && rawLines[rawLines.length - 1] === '') rawLines.pop();
    let lineIdx = 0;
    const fmt = (v) => {
      if (typeof v === 'string') return v;
      if (v === undefined) return 'undefined';
      if (v === null) return 'null';
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    };
    const push = (s) => chunks.push({ t: 'log', s: s });
    const readLine = () => {
      if (lineIdx >= rawLines.length) throw new Error('EOFError: stdin has no more lines to read.');
      return rawLines[lineIdx++];
    };
    const inputFn = (msg) => {
      if (msg != null && String(msg).length) chunks.push({ t: 'prompt', s: String(msg) });
      const v = readLine();
      chunks.push({ t: 'echo', s: v + '\n' });
      return v;
    };
    const fakeConsole = {
      log: (...a) => push(a.map(fmt).join(' ')),
      info: (...a) => push(a.map(fmt).join(' ')),
      debug: (...a) => push(a.map(fmt).join(' ')),
      warn: (...a) => push(a.map(fmt).join(' ')),
      error: (...a) => push(a.map(fmt).join(' ')),
      table: (v) => push(fmt(v)),
    };
    try {
      const fn = new Function('input', 'readline', 'prompt', 'console', code);
      fn(inputFn, readLine, inputFn, fakeConsole);
      return { timedOut: false, chunks, error: null };
    } catch (e) {
      return { timedOut: false, chunks, error: { name: e.name || 'Error', message: e.message || String(e) } };
    }
  }

  /* Assemble JS console/prompt/echo messages into stdout text */
  function assembleChunks(chunks) {
    let out = '';
    for (const c of chunks) {
      if (!c) continue;
      if (c.t === 'log') out += (c.s || '') + '\n';
      else out += (c.s || '');
      if (out.length > 60000) {
        out = out.slice(0, 60000) + '\n… (output truncated)';
        break;
      }
    }
    return out;
  }

  /* ---------------------------------------------------------
     Public runner
     --------------------------------------------------------- */
  async function run(langId, codeRaw, stdinRaw, onPhase) {
    const lang = CJ.langById(langId);
    const started = performance.now();
    const emit = (label) => {
      if (onPhase) onPhase(label);
    };

    const result = {
      status: 'success',
      stdout: '',
      compileErrors: [],
      runtimeErrors: [],
      notes: [],
      durationMs: 0,
    };

    try {
      const code = codeRaw.replace(/\t/g, '    ');
      const stdin = stdinRaw || '';

      /* ---- Stage 0: basic checks ---- */
      emit(lang.family === 'compiled' ? 'Validating source' : 'Parsing source');
      await sleep(lang.family === 'compiled' ? 140 : 110);

      if (!code.trim()) {
        result.status = 'compile_error';
        result.compileErrors.push({ message: 'Source file is empty — write some code first.', line: null });
        result.durationMs = performance.now() - started;
        return result;
      }

      const balanceErr = checkBalance(code, lang.id);
      if (balanceErr) {
        result.status = 'compile_error';
        result.compileErrors.push({ message: balanceErr.message, line: balanceErr.line });
        result.durationMs = performance.now() - started;
        return result;
      }

      /* ---- Language-specific compile checks ---- */
      const cleaned = stripComments(code, lang.id);

      if (lang.id === 'c' || lang.id === 'cpp') {
        if (!/\bint\s+main\s*\(/.test(cleaned)) {
          result.status = 'compile_error';
          result.compileErrors.push({
            message: "undefined reference to 'main' — no entry point found. Add an int main() function.",
            line: lineOf(code, 'int main'),
          });
          result.durationMs = performance.now() - started;
          return result;
        }
      }
      if (lang.id === 'java') {
        if (!/\bclass\b/.test(cleaned)) {
          result.status = 'compile_error';
          result.compileErrors.push({
            message: 'class declaration not found — every Java program lives inside a class.',
            line: null,
          });
          result.durationMs = performance.now() - started;
          return result;
        }
        if (!/static\s+void\s+main\s*\(/.test(cleaned)) {
          result.status = 'compile_error';
          result.compileErrors.push({
            message: "main method not found — expected 'public static void main(String[] args)'.",
            line: null,
          });
          result.durationMs = performance.now() - started;
          return result;
        }
      }

      /* ---- Infinite loop → time limit ---- */
      const infinite =
        /\bwhile\s*\(\s*(true|1)\s*\)/i.test(cleaned) ||
        /\bfor\s*\(\s*;?\s*;?/.test(cleaned) ||
        /while\s+True\s*:/.test(cleaned);
      if (infinite) {
        emit('Compiling source');
        await sleep(300);
        emit('Running program');
        await sleep(1900);
        result.status = 'tle';
        result.runtimeErrors.push({
          message: 'Time limit exceeded — the program never reached completion.',
          line: null,
        });
        result.durationMs = performance.now() - started;
        return result;
      }

      /* ---- Compile stage (compiled languages) ---- */
      if (lang.family === 'compiled') {
        emit('Compiling source');
        await sleep(420);
        emit('Linking');
        await sleep(200);
      }

      emit(lang.family === 'web' ? 'Preparing sandbox' : 'Running program');

      /* ---- Execute ---- */
      if (lang.family === 'web') {
        let res = null;
        try {
          res = await runJSWorker(code, stdin, 4000);
        } catch (e) {
          res = null;
        }
        if (res === null) res = runJSInline(code, stdin);
        result.stdout = assembleChunks(res.chunks);
        if (res.timedOut) {
          result.status = 'tle';
          result.runtimeErrors.push({
            message: 'Time limit exceeded (4000 ms) — the program was stopped.',
            line: null,
          });
        } else if (res.error) {
          const isSyntax = /SyntaxError|Unexpected|Invalid|Unterminated/i.test(res.error.name + res.error.message);
          if (isSyntax) {
            result.status = 'compile_error';
            result.compileErrors.push({
              message: res.error.message.replace(/^\w*Error:?\s*/, 'SyntaxError: '),
              line: null,
            });
          } else {
            result.status = 'runtime_error';
            result.runtimeErrors.push({
              message: `${res.error.name}: ${res.error.message}`,
              line: null,
            });
          }
        }
      } else {
        const ctx = makeCtx(stdin);
        try {
          if (lang.id === 'python') execPython('python', code, ctx);
          else execCFamily(lang.id, code, ctx);
        } catch (e) {
          if (e && e.stage === 'compile') {
            result.status = 'compile_error';
            result.compileErrors.push({ message: e.message, line: e.line });
          } else if (e && e.stage === 'runtime') {
            result.status = 'runtime_error';
            result.runtimeErrors.push({ message: e.message, line: e.line });
          } else {
            result.status = 'runtime_error';
            result.runtimeErrors.push({ message: e.message || String(e), line: null });
          }
        }
        result.stdout = ctx.out.join('');
        result.notes = ctx.notes;
      }

      // keep the run feeling substantial but snappy
      const elapsed = performance.now() - started;
      const floor = lang.family === 'compiled' ? 760 : lang.family === 'web' ? 320 : 480;
      if (elapsed < floor) await sleep(floor - elapsed);
    } catch (e) {
      result.status = 'runtime_error';
      result.runtimeErrors.push({ message: (e && e.message) || String(e), line: null });
    }

    result.durationMs = performance.now() - started;
    return result;
  }

  CJ.run = run;
})();
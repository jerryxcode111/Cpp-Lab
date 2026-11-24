export type TokenType =
  | 'comment'
  | 'preproc'
  | 'string'
  | 'keyword'
  | 'std'
  | 'number'
  | 'plain';

export interface HighlightToken {
  text: string;
  type: TokenType;
}

const KEYWORDS = new Set([
  'alignas', 'alignof', 'and', 'asm', 'auto', 'bool', 'break', 'case', 'catch',
  'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'concept', 'const',
  'consteval', 'constexpr', 'constinit', 'continue', 'co_await', 'co_return',
  'co_yield', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast',
  'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for',
  'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace',
  'new', 'noexcept', 'nullptr', 'operator', 'private', 'protected', 'public',
  'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed',
  'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch',
  'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef',
  'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
  'volatile', 'wchar_t', 'while',
]);

const STD_IDENTIFIERS = new Set([
  'std', 'cout', 'cin', 'cerr', 'endl', 'string', 'string_view', 'vector',
  'map', 'unordered_map', 'set', 'array', 'pair', 'tuple', 'unique_ptr',
  'shared_ptr', 'weak_ptr', 'make_unique', 'make_shared', 'accumulate', 'sort',
  'move', 'print', 'expected', 'boolalpha', 'size_t', 'fixed', 'setprecision',
  'getline', 'integral', 'ws', 'span',
]);

export const TOKEN_CLASSES: Record<TokenType, string> = {
  comment: 'text-slate-500 italic',
  preproc: 'text-pink-400',
  string: 'text-emerald-400',
  keyword: 'text-pink-400',
  std: 'text-sky-400',
  number: 'text-amber-300',
  plain: 'text-slate-100',
};

export function tokenizeCppLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const trimmed = line.trimStart();

  if (trimmed.startsWith('#')) {
    const match = line.match(/^(\s*#\w+)(.*)$/);
    if (match) {
      tokens.push({ text: match[1], type: 'preproc' });
      if (match[2]) {
        const headerMatch = match[2].match(/^(\s*)(<[^>]+>|"[^"]+")(.*)$/);
        if (headerMatch) {
          if (headerMatch[1]) tokens.push({ text: headerMatch[1], type: 'plain' });
          tokens.push({ text: headerMatch[2], type: 'string' });
          if (headerMatch[3]) tokens.push({ text: headerMatch[3], type: 'plain' });
        } else {
          tokens.push({ text: match[2], type: 'plain' });
        }
      }
      return tokens;
    }
  }

  let i = 0;
  while (i < line.length) {
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\' && j + 1 < line.length) {
          j += 2;
          continue;
        }
        if (line[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ text: line.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    if (/[0-9]/.test(line[i]) && (i === 0 || !/[A-Za-z0-9_]/.test(line[i - 1]))) {
      let j = i + 1;
      while (j < line.length && /[0-9a-fA-FxX._']/.test(line[j])) {
        j += 1;
      }
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(line[i])) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (STD_IDENTIFIERS.has(word)) {
        tokens.push({ text: word, type: 'std' });
      } else {
        tokens.push({ text: word, type: 'plain' });
      }
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < line.length && !/[A-Za-z0-9_"'/]/.test(line[j])) {
      j += 1;
    }
    tokens.push({ text: line.slice(i, j), type: 'plain' });
    i = j;
  }

  return tokens;
}

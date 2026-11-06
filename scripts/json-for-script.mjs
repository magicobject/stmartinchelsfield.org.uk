// JSON that is safe to put inside a <script> element. JSON.stringify leaves "<" alone, so a
// string such as "</script><script>..." would end the block early. Writing "<" as the six
// characters backslash-u-0-0-3-c means the same thing to a JSON parser and cannot close the
// tag. The line and paragraph separators (U+2028, U+2029) are written the same way.
const BACKSLASH = String.fromCharCode(92);
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function jsonForScript(value) {
  return JSON.stringify(value)
    .split('<').join(BACKSLASH + 'u003c')
    .split(LINE_SEPARATOR).join(BACKSLASH + 'u2028')
    .split(PARAGRAPH_SEPARATOR).join(BACKSLASH + 'u2029');
}

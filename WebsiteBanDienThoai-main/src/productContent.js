function httpImageUrl(value, base) {
  try {
    if (!value) return null;
    const url = new URL(value, base);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function readImageLine(line) {
  const value = line.trim();
  const marked = /^!\[\]\((.+)\)$/.exec(value);
  const url = httpImageUrl(marked?.[1] ?? value);
  if (!url) return null;
  return marked || /\.(?:avif|gif|jpe?g|png|webp)$/i.test(new URL(url).pathname) ? url : null;
}

export function contentFromClipboardHtml(html) {
  if (!html) return null;

  const template = document.createElement('template');
  template.innerHTML = html;
  const source = httpImageUrl(template.content.querySelector('base')?.getAttribute('href')) ?? undefined;
  let hasSupportedContent = false;

  function readNode(node, separator = '\n') {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/\s+/g, ' ');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    if (node.tagName === 'TABLE' && separator === '\n') {
      const rows = Array.from(node.rows).map(row => Array.from(row.cells).map(cell =>
        Array.from(cell.childNodes).map(child => readNode(child, '\u2028')).join('').trim()
      )).filter(row => row.some(Boolean));
      if (rows.length && rows.every(row => row.length === 2)) {
        hasSupportedContent = true;
        return '\n'+rows.map(row => row.map(cell => cell || '—').join('\t')).join('\n')+'\n';
      }
    }

    if (node.tagName === 'IMG') {
      const url = httpImageUrl(node.getAttribute('src'), source)
        ?? httpImageUrl(node.getAttribute('data-src'), source);
      if (!url) return '';
      hasSupportedContent = true;
      return separator+'![]('+url+')'+separator;
    }
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return '';
    if (node.tagName === 'BR') return separator;

    const text = Array.from(node.childNodes).map(child => readNode(child, separator)).join('');
    return /^(DIV|P|SECTION|H[1-6]|LI|TR|BLOCKQUOTE|FIGCAPTION)$/.test(node.tagName) ? text+separator : text;
  }

  const result = Array.from(template.content.childNodes).map(node => readNode(node)).join('').trim();
  return hasSupportedContent ? result : null;
}

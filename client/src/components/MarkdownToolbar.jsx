import React from 'react';

// Formatting toolbar for the post editor's markdown textarea.
// Inserts markdown syntax at the cursor (or wraps selected text).
export default function MarkdownToolbar({ textareaRef, value, onChange }) {
  function splice(before, after = '', placeholder = '') {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    const pos = start + before.length + selected.length + after.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  }

  function promptUrl(label) {
    const url = window.prompt(label);
    return url && url.trim() ? url.trim() : null;
  }

  const buttons = [
    { label: 'B', title: 'Bold', onClick: () => splice('**', '**', 'bold text') },
    { label: 'I', title: 'Italic', onClick: () => splice('*', '*', 'italic text') },
    { label: 'H2', title: 'Heading', onClick: () => splice('\n## ', '', 'Heading') },
    { label: '\u275D', title: 'Quote', onClick: () => splice('\n> ', '', 'quote') },
    {
      label: 'Link',
      title: 'Insert link',
      onClick: () => {
        const url = promptUrl('Link URL:');
        if (url) splice('[', `](${url})`, 'link text');
      },
    },
    {
      label: 'Image',
      title: 'Insert image — you can set an optional width in pixels',
      onClick: () => {
        const url = promptUrl('Image URL:');
        if (!url) return;
        const width = window.prompt('Width in pixels (optional — leave blank for full width):');
        const size = width && /^\d+$/.test(width.trim()) ? `|${width.trim()}` : '';
        splice('![', `](${url})`, `image description${size}`);
      },
    },
    {
      label: '\u25B6 YouTube',
      title: 'Embed a YouTube video (paste the video URL)',
      onClick: () => {
        const url = promptUrl('YouTube video URL (it will embed as a player in the post):');
        if (url) splice('\n[Watch on YouTube](', ')', url);
      },
    },
  ];

  return (
    <div className="md-toolbar" role="toolbar" aria-label="Formatting">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          className="md-toolbar-btn"
          title={b.title}
          onClick={b.onClick}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

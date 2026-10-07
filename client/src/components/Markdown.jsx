import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getYouTubeId } from './media';

function MarkdownLink({ href, children }) {
  const ytId = getYouTubeId(href);
  if (ytId) {
    return (
      <div className="video-embed">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Embedded YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}

// Parses an optional size suffix in the image alt text:
//   ![caption|600](url)      -> 600px wide (never wider than the column)
//   ![caption|600x400](url)  -> 600px wide, 400px tall
// The suffix is stripped from the rendered alt text.
function parseImgSize(alt) {
  const m = /^(.*?)\|(\d+)(?:x(\d+))?\s*$/.exec(alt || '');
  if (!m) return { alt: alt || '', width: null, height: null };
  return {
    alt: m[1].trim(),
    width: parseInt(m[2], 10),
    height: m[3] ? parseInt(m[3], 10) : null,
  };
}

function MarkdownImage({ src, alt, title }) {
  const { alt: cleanAlt, width, height } = parseImgSize(alt);
  const style = {};
  if (width) {
    style.width = width;
    style.maxWidth = '100%';
  }
  if (height) style.height = height;
  return <img src={src} alt={cleanAlt} title={title} style={style} loading="lazy" />;
}

// Renders post markdown:
// - YouTube links (and bare YouTube URLs, via GFM autolink) become embedded players.
// - Images support an optional |WIDTH or |WIDTHxHEIGHT suffix in the alt text.
// - All other links open in a new tab.
export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink, img: MarkdownImage }}>
      {children}
    </ReactMarkdown>
  );
}

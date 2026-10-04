import React from 'react';
import ReactMarkdown from 'react-markdown';

// Extracts a YouTube video ID from watch, embed, shorts, and youtu.be URLs.
// Returns null for non-video YouTube URLs (channels, playlists, etc.).
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

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

// Renders post markdown. YouTube links become embedded players;
// all other links open in a new tab.
export default function Markdown({ children }) {
  return <ReactMarkdown components={{ a: MarkdownLink }}>{children}</ReactMarkdown>;
}

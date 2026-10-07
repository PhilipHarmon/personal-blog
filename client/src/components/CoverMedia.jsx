import React from 'react';
import { Link } from 'react-router-dom';
import { getYouTubeId, isVideoFile } from './media';

// Renders a post cover that can be an image, a video file, or a YouTube video.
// - YouTube URLs become 16:9 embeds.
// - .mp4/.webm/.m4v/.mov URLs become silent looping video covers.
// - Anything else renders as an image (previous behavior).
export default function CoverMedia({ src, title, linkTo, className }) {
  if (!src) return null;

  const ytId = getYouTubeId(src);
  let media;
  if (ytId) {
    media = (
      <div className="cover-video-embed">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title={title || 'Embedded YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  } else if (isVideoFile(src)) {
    media = (
      <video src={src} muted loop playsInline autoPlay preload="metadata" aria-label={title || 'Post cover video'} />
    );
  } else {
    media = <img src={src} alt={title} loading="lazy" />;
  }

  if (linkTo) {
    return (
      <Link to={linkTo} className={className} aria-label={title}>
        {media}
      </Link>
    );
  }
  return <div className={className}>{media}</div>;
}

// Shared media-URL helpers for the blog.

// Extracts a YouTube video ID from watch, embed, shorts, and youtu.be URLs.
// Returns null for non-video YouTube URLs (channels, playlists, etc.).
export function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// True for direct video file URLs (used for video covers).
export function isVideoFile(url) {
  return /\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(url || '');
}

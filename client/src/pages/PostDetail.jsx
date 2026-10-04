import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from '../components/Markdown.jsx';
import api from '../api.js';
import LikeButton from '../components/LikeButton.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { formatDate } from '../components/PostCard.jsx';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/posts/${slug}`);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? 'That post could not be found.'
              : 'Could not load the post. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="narrow">
        <p className="muted">Loading post…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="narrow">
        <p className="alert alert-error">{error}</p>
        <p>
          <Link to="/">← Back to all posts</Link>
        </p>
      </div>
    );
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <article className="narrow post-detail">
      <p>
        <Link to="/">← All posts</Link>
      </p>
      <h1 className="post-title">{post.title}</h1>
      <p className="post-meta">
        {formatDate(post.publishedAt || post.createdAt)}
        {tags.length > 0 && (
          <span className="tag-list">
            {tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </span>
        )}
      </p>
      {post.coverImage && (
        <img className="post-cover" src={post.coverImage} alt={post.title} loading="lazy" />
      )}
      <div className="post-body">
        <Markdown>{post.content}</Markdown>
      </div>

      <div className="post-actions">
        <LikeButton
          postId={post.id}
          initialLiked={!!post.liked}
          initialCount={post.likeCount ?? 0}
        />
        <ShareButtons
          postId={post.id}
          title={post.title}
          slug={post.slug}
          shareCounts={post.shareCounts}
        />
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}

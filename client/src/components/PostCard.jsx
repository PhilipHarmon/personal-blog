import React from 'react';
import { Link } from 'react-router-dom';

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PostCard({ post }) {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  return (
    <article className="post-card">
      {post.coverImage && (
        <Link to={`/post/${post.slug}`} className="post-card-cover">
          <img src={post.coverImage} alt={post.title} loading="lazy" />
        </Link>
      )}
      <div className="post-card-body">
        <h2 className="post-card-title">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="post-card-meta">
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
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        <p className="post-card-counts">
          ♥ {post.likeCount ?? 0} &nbsp;·&nbsp; 💬 {post.commentCount ?? 0}
        </p>
      </div>
    </article>
  );
}

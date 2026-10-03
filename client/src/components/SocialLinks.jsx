import React from 'react';
import { socialLinks } from '../siteConfig.js';

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const icons = {
  x: (
    <g>
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </g>
  ),
  instagram: (
    <g>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </g>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  github: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  linkedin: (
    <g>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </g>
  ),
  youtube: (
    <g>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </g>
  ),
  threads: (
    <g>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.4 9.7" />
      <path d="M12 8.8a3.2 3.2 0 1 0 3.2 3.2c0-1.2-.9-2.1-2-2.1" />
      <path d="M14.9 13.4l2.7 5.1" />
    </g>
  ),
  reddit: (
    <g>
      <ellipse cx="12" cy="14.5" rx="7" ry="4.8" />
      <circle cx="5.2" cy="12.3" r="1.1" />
      <circle cx="18.8" cy="12.3" r="1.1" />
      <circle cx="9.6" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9.3 17c1.6 1 3.8 1 5.4 0" />
      <path d="M12 9.8L15.5 5" />
      <circle cx="16" cy="4.3" r="1" />
    </g>
  ),
  flickr: (
    <g>
      <circle cx="8" cy="12" r="3.6" />
      <circle cx="16" cy="12" r="3.6" />
    </g>
  ),
  tumblr: (
    <g>
      <path d="M11 3.5V17" />
      <path d="M7 7.5h8" />
      <path d="M11 17c0 2.2 1.6 3.5 4.2 3.5" />
    </g>
  ),
  spotify: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10.8c2.6-.9 5.4-.6 7.8.9" />
      <path d="M8.4 13.4c2-.7 4-.5 5.8.7" />
      <path d="M8.8 15.8c1.5-.5 3-.4 4.4.5" />
    </g>
  ),
};

export default function SocialLinks() {
  const active = socialLinks.filter((s) => s.url && s.url.trim());
  if (active.length === 0) return null;
  return (
    <div className="social-links">
      {active.map((s) => (
        <a
          key={s.key}
          href={s.url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={s.label}
          title={s.label}
        >
          {icons[s.key] ? (
            <svg {...iconProps}>{icons[s.key]}</svg>
          ) : (
            <span className="social-letter">{s.label.charAt(0).toUpperCase()}</span>
          )}
        </a>
      ))}
    </div>
  );
}

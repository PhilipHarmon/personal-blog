const crypto = require('crypto');
const Subscriber = require('./models/Subscriber');
const { sendNewPostEmail } = require('./mailer');

function siteUrl() {
  return (process.env.CLIENT_URL || '').replace(/\/$/, '');
}

// Lazily issues an unsubscribe token for subscribers created before
// tokens existed.
async function ensureUnsubscribeToken(sub) {
  if (!sub.unsubscribeToken) {
    sub.unsubscribeToken = crypto.randomBytes(24).toString('hex');
    await sub.save();
  }
  return sub.unsubscribeToken;
}

// Emails every subscriber about a newly published post. Runs in the
// background — never throws, never blocks the request that triggered it.
async function notifySubscribers(post) {
  try {
    const subs = await Subscriber.find({});
    if (!subs.length) {
      console.log('New-post notification: no subscribers, skipping');
      return;
    }
    const base = siteUrl();
    const postUrl = `${base}/post/${post.slug}`;
    let sent = 0;
    for (const sub of subs) {
      const token = await ensureUnsubscribeToken(sub);
      const result = await sendNewPostEmail({
        to: sub.email,
        title: post.title,
        excerpt: post.excerpt,
        postUrl,
        unsubscribeUrl: `${base}/unsubscribe?token=${token}`,
      });
      if (result.sent) sent += 1;
    }
    console.log(`New-post notification: ${sent}/${subs.length} sent for "${post.title}"`);
  } catch (err) {
    console.error('New-post notification failed:', err.message);
  }
}

module.exports = { notifySubscribers, ensureUnsubscribeToken, siteUrl };

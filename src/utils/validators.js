export const REACTIONS = [
  { kind: 'love', emoji: '❤️', label: 'Love' },
  { kind: 'haha', emoji: '😂', label: 'Haha' },
  { kind: 'wow', emoji: '😮', label: 'Wow' },
  { kind: 'like', emoji: '👍', label: 'Like' },
  { kind: 'dislike', emoji: '👎', label: 'Dislike' },
  { kind: 'what', emoji: '🤔', label: 'What?' },
];

export const MAX_CAPTION_LENGTH = 300;
export const MAX_COMMENT_LENGTH = 300;
export const MAX_POST_ITEMS = 6;
export const MAX_VIDEO_SECONDS = 15;
export const FEED_PAGE_SIZE = 10;

export function validatePin(pin) {
  if (!/^\d{6}$/.test(String(pin || ''))) {
    return 'Please enter a 6-digit PIN using only numbers.';
  }
  return null;
}

export function validateCaption(caption) {
  const trimmed = String(caption || '').trim();
  if (!trimmed) {
    return 'Please write a short caption before posting.';
  }
  if (trimmed.length > MAX_CAPTION_LENGTH) {
    return `Your caption is too long. Please keep it under ${MAX_CAPTION_LENGTH} characters.`;
  }
  return null;
}

export function validateComment(body) {
  const trimmed = String(body || '').trim();
  if (!trimmed) {
    return 'Please write a short message first.';
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return `Your comment is too long. Please keep it under ${MAX_COMMENT_LENGTH} characters.`;
  }
  return null;
}

export function validatePostMedia(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Please choose at least one photo or short video.';
  }
  if (items.length > MAX_POST_ITEMS) {
    return `You can share up to ${MAX_POST_ITEMS} items in one post.`;
  }
  const videos = items.filter((item) => item.kind === 'video');
  if (videos.length > 1) {
    return 'You can add only one video per post.';
  }
  if (videos[0] && Number(videos[0].durationSeconds || 0) > MAX_VIDEO_SECONDS) {
    return `Videos can be up to ${MAX_VIDEO_SECONDS} seconds long.`;
  }
  return null;
}

export function validateInvite(invite, now = new Date()) {
  if (!invite) {
    return 'That invitation code was not found. Ask a family admin to send a new one.';
  }
  if (invite.used_by) {
    return 'This invitation code has already been used.';
  }
  if (new Date(invite.expires_at).getTime() <= now.getTime()) {
    return 'This invitation code has expired. Ask a family admin for a new one.';
  }
  return null;
}

export function isPostNew(post, lastSeenAt) {
  if (!lastSeenAt || !post?.created_at) return false;
  return new Date(post.created_at).getTime() > new Date(lastSeenAt).getTime();
}

export function formatPostTime(isoDate, now = new Date()) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfDate) / 86400000);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Yesterday at ${timeStr}`;
  if (diffDays > 1 && diffDays < 7) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${weekday} at ${timeStr}`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let partA = '';
  let partB = '';
  for (let i = 0; i < 4; i += 1) {
    partA += chars[Math.floor(Math.random() * chars.length)];
    partB += chars[Math.floor(Math.random() * chars.length)];
  }
  return `KIN-${partA}-${partB}`;
}

import { createContext, useContext, useMemo, useState } from 'react';
import {
  INITIAL_COMMENTS,
  INITIAL_INVITES,
  INITIAL_POSTS,
  INITIAL_REACTIONS,
  INITIAL_USERS,
} from '../data/mockData';
import {
  generateInviteCode,
  validateCaption,
  validateComment,
  validateInvite,
  validatePin,
  validatePostMedia,
} from '../utils/validators';

const AppContext = createContext(null);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AppProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [invites, setInvites] = useState(INITIAL_INVITES);

  // Start logged in as Abuela Elena by default so Phase 1 review opens straight into Simple Mode,
  // with the top DevRoleBar letting reviewers flip to Full Mode, Admin, or Login/Invite immediately.
  const [currentUserId, setCurrentUserId] = useState('u-elena');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'profile' | 'admin'
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'invite'

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId],
  );

  // Mark feed seen when navigating away from the feed (per spec: "last visit updates when they leave the feed")
  function navigateTab(nextTab) {
    if (activeTab === 'feed' && nextTab !== 'feed' && currentUserId) {
      const nowIso = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUserId ? { ...u, last_seen_at: nowIso } : u)),
      );
    }
    setActiveTab(nextTab);
  }

  function switchPreviewUser(userId) {
    if (!userId) {
      setCurrentUserId(null);
      setAuthScreen('login');
      return;
    }
    setCurrentUserId(userId);
    setActiveTab('feed');
  }

  async function loginWithPin(email, pin) {
    await sleep(350);
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { error: 'Please type your email address.' };
    }
    const pinErr = validatePin(pin);
    if (pinErr) {
      return { error: pinErr };
    }
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { error: 'We could not find that email in your family circle.' };
    }
    if (user.pin !== pin) {
      return { error: 'That PIN is not right. Try again.' };
    }
    setCurrentUserId(user.id);
    setActiveTab('feed');
    return { error: null };
  }

  async function joinWithInvite({ code, email, nickname, pin }) {
    await sleep(400);
    const cleanCode = String(code || '').trim().toUpperCase();
    const invite = invites.find((i) => i.code.toUpperCase() === cleanCode);
    const inviteErr = validateInvite(invite);
    if (inviteErr) {
      return { error: inviteErr };
    }
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'This email is already part of the family circle. Try signing in instead.' };
    }
    const cleanNick = String(nickname || '').trim();
    if (!cleanNick) {
      return { error: 'Please enter the name your family calls you.' };
    }
    const pinErr = validatePin(pin);
    if (pinErr) {
      return { error: pinErr };
    }

    const newUserId = `u-${Date.now()}`;
    const newUser = {
      id: newUserId,
      nickname: cleanNick,
      email: cleanEmail,
      pin,
      role: invite.role,
      screen_mode: invite.screen_mode,
      bigger_text: false,
      avatar_url: '',
      last_seen_at: new Date(Date.now() - 86400000).toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setInvites((prev) =>
      prev.map((i) => (i.code === invite.code ? { ...i, used_by: newUserId } : i)),
    );
    setCurrentUserId(newUserId);
    setActiveTab('feed');
    return { error: null };
  }

  function logout() {
    setCurrentUserId(null);
    setAuthScreen('login');
  }

  function toggleReaction(postId, kind) {
    if (!currentUserId) return;
    setReactions((prev) => {
      const existing = prev.find((r) => r.post_id === postId && r.user_id === currentUserId);
      if (existing && existing.kind === kind) {
        return prev.filter((r) => !(r.post_id === postId && r.user_id === currentUserId));
      }
      if (existing) {
        return prev.map((r) =>
          r.post_id === postId && r.user_id === currentUserId ? { ...r, kind } : r,
        );
      }
      return [...prev, { post_id: postId, user_id: currentUserId, kind }];
    });
  }

  async function addComment(postId, body) {
    const err = validateComment(body);
    if (err) return { error: err };
    await sleep(180);
    const newComment = {
      id: `c-${Date.now()}`,
      post_id: postId,
      author_id: currentUserId,
      body: body.trim(),
      hidden: false,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    return { error: null };
  }

  function deleteComment(commentId) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function createPost({ caption, media, simulateDrop, onProgress }) {
    const captionErr = validateCaption(caption);
    if (captionErr) return { error: captionErr };
    const mediaErr = validatePostMedia(media);
    if (mediaErr) return { error: mediaErr };

    onProgress?.(15, 'Resizing photos on your device...');
    await sleep(320);
    onProgress?.(45, 'Uploading photos and video...');
    await sleep(350);

    if (simulateDrop) {
      return {
        error: 'Your internet connection dropped during upload. Tap "Retry upload" to try again without losing your post.',
      };
    }

    onProgress?.(85, 'Saving your post...');
    await sleep(260);
    onProgress?.(100, 'Done!');

    const nowIso = new Date().toISOString();
    const newPost = {
      id: `p-${Date.now()}`,
      author_id: currentUserId,
      caption: caption.trim(),
      hidden: false,
      created_at: nowIso,
      updated_at: nowIso,
      media: media.map((item, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        kind: item.kind,
        url: item.url,
        posterUrl: item.posterUrl || item.url,
        durationSeconds: item.durationSeconds,
        alt: item.alt || `Shared ${item.kind}`,
        position: idx,
      })),
    };
    setPosts((prev) => [newPost, ...prev]);
    return { error: null };
  }

  function editPostCaption(postId, newCaption) {
    const err = validateCaption(newCaption);
    if (err) return { error: err };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, caption: newCaption.trim(), updated_at: new Date().toISOString() }
          : p,
      ),
    );
    return { error: null };
  }

  function deletePost(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setReactions((prev) => prev.filter((r) => r.post_id !== postId));
    setComments((prev) => prev.filter((c) => c.post_id !== postId));
  }

  function togglePostHidden(postId) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hidden: !p.hidden } : p)));
  }

  function updateOwnProfile({ nickname, avatar_url, bigger_text }) {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        return {
          ...u,
          nickname: nickname !== undefined ? nickname.trim() || u.nickname : u.nickname,
          avatar_url: avatar_url !== undefined ? avatar_url : u.avatar_url,
          bigger_text: bigger_text !== undefined ? bigger_text : u.bigger_text,
        };
      }),
    );
  }

  function createInvite({ role, screen_mode }) {
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 86400000);
    const invite = {
      code: generateInviteCode(),
      role,
      screen_mode,
      created_by: currentUserId,
      created_at: now.toISOString(),
      expires_at: expires.toISOString(),
      used_by: null,
    };
    setInvites((prev) => [invite, ...prev]);
    return invite;
  }

  function updateMemberSettings(userId, patch) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
  }

  function resetMemberPin(userId, newPin) {
    const err = validatePin(newPin);
    if (err) return { error: err };
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, pin: newPin } : u)));
    return { error: null };
  }

  function removeMember(userId) {
    const userPostIds = new Set(posts.filter((p) => p.author_id === userId).map((p) => p.id));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setPosts((prev) => prev.filter((p) => p.author_id !== userId));
    setComments((prev) => prev.filter((c) => c.author_id !== userId && !userPostIds.has(c.post_id)));
    setReactions((prev) => prev.filter((r) => r.user_id !== userId && !userPostIds.has(r.post_id)));
    if (currentUserId === userId) {
      setCurrentUserId(null);
    }
  }

  const value = {
    users,
    posts,
    reactions,
    comments,
    invites,
    currentUser,
    activeTab,
    authScreen,
    setAuthScreen,
    navigateTab,
    switchPreviewUser,
    loginWithPin,
    joinWithInvite,
    logout,
    toggleReaction,
    addComment,
    deleteComment,
    createPost,
    editPostCaption,
    deletePost,
    togglePostHidden,
    updateOwnProfile,
    createInvite,
    updateMemberSettings,
    resetMemberPin,
    removeMember,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

import { useState } from 'react';
import { Eye, EyeOff, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { FEED_PAGE_SIZE, formatPostTime, isPostNew, MAX_CAPTION_LENGTH } from '../utils/validators';
import Avatar from '../components/Avatar';
import MediaCarousel from '../components/MediaCarousel';
import ReactionBar from '../components/ReactionBar';
import CommentsPanel from '../components/CommentsPanel';
import InstallPrompt from '../components/InstallPrompt';
import CreatePostModal from './CreatePostModal';

export default function FullFeedView() {
  const {
    posts,
    users,
    comments,
    currentUser,
    editPostCaption,
    deletePost,
    togglePostHidden,
  } = useApp();

  const [limit, setLimit] = useState(FEED_PAGE_SIZE);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isAdmin = currentUser?.role === 'admin';
  const visiblePosts = posts.filter((p) => !p.hidden || isAdmin);
  const shownPosts = visiblePosts.slice(0, limit);
  const hasMore = visiblePosts.length > limit;

  function startEdit(post) {
    setEditingPostId(post.id);
    setEditText(post.caption);
    setEditError('');
  }

  function saveEdit(postId) {
    const res = editPostCaption(postId, editText);
    if (res.error) {
      setEditError(res.error);
      return;
    }
    setEditingPostId(null);
  }

  const activeCommentsPost = commentsPostId
    ? posts.find((p) => p.id === commentsPostId)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header action bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#000000]">
            Family Feed
          </h1>
          <p className="text-sm text-[#1D1D1F]">
            Newest updates first · {visiblePosts.length} posts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="min-h-[48px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] active:scale-[0.98] text-white font-semibold px-5 inline-flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>

      <InstallPrompt />

      {/* Feed Cards */}
      <div className="space-y-6">
        {shownPosts.map((post) => {
          const author = users.find((u) => u.id === post.author_id);
          const isAuthor = post.author_id === currentUser?.id;
          const postIsNew = isPostNew(post, currentUser?.last_seen_at);
          const commentCount = comments.filter(
            (c) => c.post_id === post.id && !c.hidden,
          ).length;

          return (
            <article
              key={post.id}
              className={`bg-[#FFFFFF] rounded-3xl border p-5 sm:p-6 space-y-4 transition ${
                post.hidden ? 'border-[#5A122C] opacity-75' : 'border-[#D2D2D7]'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar user={author} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base text-[#000000]">
                        {author?.nickname || 'Family'}
                      </h2>
                      {postIsNew && (
                        <span className="rounded-full bg-[#5A122C] text-white text-xs font-bold px-2.5 py-0.5">
                          New
                        </span>
                      )}
                      {post.hidden && (
                        <span className="rounded-full bg-[#F5F5F7] border border-[#5A122C] text-[#5A122C] text-xs font-bold px-2.5 py-0.5">
                          Hidden by admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1D1D1F]">
                      {formatPostTime(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* Author / Admin actions */}
                {(isAuthor || isAdmin) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => startEdit(post)}
                        className="min-h-[38px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#000000] hover:bg-[#F5F5F7] inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => togglePostHidden(post.id)}
                        className="min-h-[38px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#000000] hover:bg-[#F5F5F7] inline-flex items-center gap-1"
                      >
                        {post.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{post.hidden ? 'Unhide' : 'Hide'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(post.id)}
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#5A122C] hover:bg-[#FDF2F4] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete confirmation inline banner */}
              {confirmDeleteId === post.id && (
                <div className="rounded-2xl bg-[#FDF2F4] border border-[#5A122C] p-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#5A122C]">
                    Delete this post and its photos permanently?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="min-h-[40px] rounded-xl bg-[#FFFFFF] border border-[#D2D2D7] px-4 text-sm font-semibold text-[#000000]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePost(post.id);
                        setConfirmDeleteId(null);
                      }}
                      className="min-h-[40px] rounded-xl bg-[#5A122C] px-4 text-sm font-semibold text-white"
                    >
                      Yes, delete
                    </button>
                  </div>
                </div>
              )}

              {/* Media */}
              <MediaCarousel media={post.media} />

              {/* Caption or Edit Box */}
              {editingPostId === post.id ? (
                <div className="space-y-2 bg-[#F5F5F7] rounded-2xl p-4 border border-[#D2D2D7]">
                  {editError && (
                    <p role="alert" className="text-sm font-semibold text-[#5A122C]">
                      {editError}
                    </p>
                  )}
                  <textarea
                    rows={3}
                    maxLength={MAX_CAPTION_LENGTH}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] p-3 text-base text-[#000000]"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#1D1D1F]">
                      {editText.length} / {MAX_CAPTION_LENGTH}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPostId(null)}
                        className="min-h-[40px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-4 text-sm font-semibold text-[#000000]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(post.id)}
                        className="min-h-[40px] rounded-xl bg-[#0071E3] px-4 text-sm font-semibold text-white"
                      >
                        Save caption
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[17px] leading-relaxed text-[#000000] font-normal">
                  {post.caption}
                </p>
              )}

              {/* Reactions */}
              <ReactionBar post={post} />

              {/* Comments Button */}
              <div className="pt-1 border-t border-[#F5F5F7]">
                <button
                  type="button"
                  onClick={() => setCommentsPostId(post.id)}
                  className="min-h-[44px] rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] hover:bg-[#E8E8ED] px-4 text-sm font-semibold text-[#000000] inline-flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-[#0071E3]" />
                  <span>
                    {commentCount === 0
                      ? 'Add a comment'
                      : `Comments (${commentCount})`}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination (10 at a time) */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + FEED_PAGE_SIZE)}
            className="min-h-[48px] rounded-2xl border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F5F5F7] px-6 text-base font-semibold text-[#000000] transition"
          >
            Show older posts ({visiblePosts.length - limit} more)
          </button>
        </div>
      )}

      {composerOpen && <CreatePostModal onClose={() => setComposerOpen(false)} />}

      {activeCommentsPost && (
        <CommentsPanel
          post={activeCommentsPost}
          onClose={() => setCommentsPostId(null)}
        />
      )}
    </div>
  );
}

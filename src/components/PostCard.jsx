import { useState } from 'react';
import { Eye, EyeOff, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { formatPostTime, isPostNew, MAX_CAPTION_LENGTH } from '../utils/validators';
import Avatar from './Avatar';
import MediaCarousel from './MediaCarousel';
import ReactionBar from './ReactionBar';

export default function PostCard({ post, onOpenComments }) {
  const {
    users,
    currentUser,
    comments,
    editPostCaption,
    deletePost,
    togglePostHidden,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.caption);
  const [editError, setEditError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const author = users.find((u) => u.id === post.author_id);
  const isAuthor = post.author_id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';
  const postIsNew = isPostNew(post, currentUser?.last_seen_at);
  const commentCount = comments.filter(
    (c) => c.post_id === post.id && !c.hidden,
  ).length;

  function startEdit() {
    setIsEditing(true);
    setEditText(post.caption);
    setEditError('');
    setMenuOpen(false);
  }

  function saveEdit() {
    const res = editPostCaption(post.id, editText);
    if (res.error) {
      setEditError(res.error);
      return;
    }
    setIsEditing(false);
  }

  return (
    <article
      className={`bg-[#FFFFFF] rounded-3xl border p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs transition ${
        post.hidden ? 'border-[#5A122C] opacity-75' : 'border-[#D2D2D7]'
      }`}
    >
      {/* Card Header: Author + Timestamp + Actions */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-3">
          <Avatar user={author} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="simple-heading font-bold text-[#000000]">
                {author?.nickname || 'Family'}
              </h2>
              {postIsNew && (
                <span className="rounded-full bg-[#5A122C] text-white px-3 py-0.5 text-xs font-bold">
                  New
                </span>
              )}
              {post.hidden && (
                <span className="rounded-full bg-[#F5F5F7] border border-[#5A122C] text-[#5A122C] text-xs font-bold px-2 py-0.5">
                  Hidden
                </span>
              )}
            </div>
            <p className="text-[18px] font-medium text-[#1D1D1F]">
              {formatPostTime(post.created_at)}
            </p>
          </div>
        </div>

        {/* Discrete Author / Admin Actions Menu */}
        {(isAuthor || isAdmin) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Post options"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#D2D2D7] py-1.5 w-48 text-base font-semibold divide-y divide-[#F5F5F7] animate-in fade-in zoom-in-95">
                {isAuthor && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="w-full text-left px-4 py-3 text-[#000000] hover:bg-[#F5F5F7] flex items-center gap-2.5"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit caption</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      togglePostHidden(post.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-[#000000] hover:bg-[#F5F5F7] flex items-center gap-2.5"
                  >
                    {post.hidden ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Unhide post</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide post</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[#5A122C] hover:bg-[#FDF2F4] flex items-center gap-2.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Delete Confirmation */}
      {confirmDelete && (
        <div className="rounded-2xl bg-[#FDF2F4] border border-[#5A122C] p-3.5 space-y-2">
          <p className="text-sm font-semibold text-[#5A122C]">
            Delete this post and its photos permanently?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="min-h-[40px] rounded-xl bg-[#FFFFFF] border border-[#D2D2D7] px-4 text-xs font-semibold text-[#000000]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deletePost(post.id);
                setConfirmDelete(false);
              }}
              className="min-h-[40px] rounded-xl bg-[#5A122C] px-4 text-xs font-semibold text-white"
            >
              Yes, delete
            </button>
          </div>
        </div>
      )}

      {/* Photo or Video Carousel (Generous proportions, minimal dots) */}
      <MediaCarousel media={post.media} simple />

      {/* Caption with Simple Mode text size (`simple-caption`) */}
      {isEditing ? (
        <div className="space-y-2 bg-[#F5F5F7] rounded-2xl p-3 border border-[#D2D2D7]">
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
                onClick={() => setIsEditing(false)}
                className="min-h-[40px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-3.5 text-xs font-semibold text-[#000000]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="min-h-[40px] rounded-xl bg-[#0071E3] px-4 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="simple-caption font-medium text-[#000000] leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Single Reaction Button with Floating Emoji Pill */}
      <ReactionBar post={post} simple />

      {/* Full-width, bold Blue Comment Button from Simple Mode */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onOpenComments?.(post.id)}
          className="w-full min-h-[56px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] active:scale-[0.98] text-white font-bold text-[20px] inline-flex items-center justify-center gap-2.5 transition shadow-xs"
        >
          <MessageCircle className="w-6 h-6" />
          <span>
            {commentCount === 0
              ? 'Write a comment'
              : `Comments (${commentCount})`}
          </span>
        </button>
      </div>
    </article>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, MessageCircle, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { formatPostTime, isPostNew, MAX_CAPTION_LENGTH } from '../utils/validators';
import Avatar from '../components/Avatar';
import MediaCarousel from '../components/MediaCarousel';
import ReactionBar from '../components/ReactionBar';
import CommentsPanel from '../components/CommentsPanel';

export default function FeedView({ onOpenComposer }) {
  const {
    posts,
    users,
    comments,
    currentUser,
    editPostCaption,
    deletePost,
    togglePostHidden,
  } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [onlyNew, setOnlyNew] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);

  // Author / Admin editing & management
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);

  const containerRef = useRef(null);
  const slideRefs = useRef([]);

  const isSimpleUser = currentUser?.screen_mode === 'simple';
  const isAdmin = currentUser?.role === 'admin';
  const visiblePosts = posts.filter((p) => !p.hidden || isAdmin);
  const newPostsCount = visiblePosts.filter((p) =>
    isPostNew(p, currentUser?.last_seen_at),
  ).length;

  const displayedPosts = onlyNew
    ? visiblePosts.filter((p) => isPostNew(p, currentUser?.last_seen_at))
    : visiblePosts;

  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [onlyNew]);

  // Track active slide as user scrolls/swipes
  useEffect(() => {
    const root = containerRef.current;
    if (!root || displayedPosts.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!Number.isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        }
      },
      { root, threshold: 0.6 },
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [displayedPosts.length]);

  function startEdit(post) {
    setEditingPostId(post.id);
    setEditText(post.caption);
    setEditError('');
    setOpenMenuPostId(null);
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

  const textScaleClass = currentUser?.bigger_text
    ? 'simple-text-bigger'
    : 'simple-text-normal';

  return (
    <div className={`${textScaleClass} flex flex-col h-[calc(100vh-80px)] min-h-[540px] bg-[#F5F5F7]`}>
      <div className="bg-[#FFFFFF] border-b border-[#D2D2D7] px-4 py-2.5 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="simple-heading font-bold text-[#000000]">Family</span>
          </div>

          <div className="flex items-center gap-2">
            {newPostsCount > 0 && (
              <button
                type="button"
                onClick={() => setOnlyNew((v) => !v)}
                className={`h-[46px] px-4 rounded-2xl font-bold text-[18px] inline-flex items-center gap-2 border transition  border-[#5A122C] ${
                  onlyNew
                    ? 'bg-[#5A122C] text-white'
                    : 'bg-[#FFFFFF] text-[#5A122C]'
                }`}
              >
                <span>{onlyNew ? 'Show all posts' : `${newPostsCount} New`}</span>
              </button>
            )}
            {!isSimpleUser && (
              // Full mode: "New Post" button (+ new posts count filter)
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenComposer}
                  className="h-[46px] px-4 rounded-xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-bold text-sm inline-flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Post</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* One-by-one vertical snap feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar px-3 sm:px-6 pb-20"
      >
        {displayedPosts.length === 0 ? (
          <div className="max-w-md mx-auto py-16">
            <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-8 text-center space-y-4 shadow-xs">
              <p className="simple-heading font-bold text-[#000000]">You are all caught up!</p>
              <p className="simple-body text-[#1D1D1F]">
                There are no new posts since your last visit.
              </p>
              {onlyNew && (
                <button
                  type="button"
                  onClick={() => setOnlyNew(false)}
                  className="min-h-[50px] px-6 rounded-2xl bg-[#0071E3] text-white font-bold text-[18px]"
                >
                  See all family posts
                </button>
              )}
            </div>
          </div>
        ) : (
          displayedPosts.map((post, idx) => {
            const author = users.find((u) => u.id === post.author_id);
            const isAuthor = post.author_id === currentUser?.id;
            const postIsNew = isPostNew(post, currentUser?.last_seen_at);
            const commentCount = comments.filter(
              (c) => c.post_id === post.id && !c.hidden,
            ).length;
            const menuOpen = openMenuPostId === post.id;

            return (
              <section
                key={post.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                data-index={idx}
                aria-label={`Post by ${author?.nickname || 'Family'}`}
                className="snap-start snap-always min-h-full pt-3 pb-20 flex flex-col justify-start max-w-md mx-auto w-full"
              >
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
                          onClick={() => setOpenMenuPostId(menuOpen ? null : post.id)}
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
                                onClick={() => startEdit(post)}
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
                                  setOpenMenuPostId(null);
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
                                setConfirmDeleteId(post.id);
                                setOpenMenuPostId(null);
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
                  {confirmDeleteId === post.id && (
                    <div className="rounded-2xl bg-[#FDF2F4] border border-[#5A122C] p-3.5 space-y-2">
                      <p className="text-sm font-semibold text-[#5A122C]">
                        Delete this post and its photos permanently?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[40px] rounded-xl bg-[#FFFFFF] border border-[#D2D2D7] px-4 text-xs font-semibold text-[#000000]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deletePost(post.id);
                            setConfirmDeleteId(null);
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
                  {editingPostId === post.id ? (
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
                            onClick={() => setEditingPostId(null)}
                            className="min-h-[40px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-3.5 text-xs font-semibold text-[#000000]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(post.id)}
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
                      onClick={() => setCommentsPostId(post.id)}
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
              </section>
            );
          })
        )}
      </div>

      {activeCommentsPost && (
        <CommentsPanel
          post={activeCommentsPost}
          simple
          onClose={() => setCommentsPostId(null)}
        />
      )}
    </div>
  );
}

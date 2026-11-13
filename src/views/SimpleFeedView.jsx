import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { formatPostTime, isPostNew } from '../utils/validators';
import Avatar from '../components/Avatar';
import MediaCarousel from '../components/MediaCarousel';
import ReactionBar from '../components/ReactionBar';
import CommentsPanel from '../components/CommentsPanel';
import InstallPrompt from '../components/InstallPrompt';

export default function SimpleFeedView() {
  const { posts, users, comments, currentUser } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [onlyNew, setOnlyNew] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const containerRef = useRef(null);
  const slideRefs = useRef([]);

  const visiblePosts = posts.filter((p) => !p.hidden);
  const newPostsCount = visiblePosts.filter((p) =>
    isPostNew(p, currentUser?.last_seen_at),
  ).length;

  const displayedPosts = onlyNew
    ? visiblePosts.filter((p) => isPostNew(p, currentUser?.last_seen_at))
    : visiblePosts;

  // Keep activeIndex in bounds when filter toggles
  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [onlyNew]);

  // Track which snap slide is currently in view when user swipes vertically (TikTok-style)
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

  const activeCommentsPost = commentsPostId
    ? posts.find((p) => p.id === commentsPostId)
    : null;

  const textScaleClass = currentUser?.bigger_text
    ? 'simple-text-bigger'
    : 'simple-text-normal';

  return (
    <div className={`${textScaleClass} flex flex-col h-[calc(100vh-116px)] min-h-[540px] bg-[#F5F5F7]`}>
      {/* Clear always-visible top status & step controls (supports both swipe and tap) */}
      <div className="bg-[#FFFFFF] border-b border-[#D2D2D7] px-4 py-2.5 shrink-0">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="simple-heading font-bold text-[#000000]">Family</span>
          </div>

          <div className="flex items-center gap-2">
            {newPostsCount > 0 && (
              <button
                type="button"
                onClick={() => setOnlyNew((v) => !v)}
                className={`min-h-[44px] px-4 rounded-2xl font-bold text-[19px] inline-flex items-center gap-2 border transition ${onlyNew
                  ? 'bg-[#5A122C] text-white border-[#5A122C]'
                  : 'bg-[#FFFFFF] text-[#5A122C] border-[#5A122C] hover:bg-[#FDF2F4]'
                  }`}
              >
                <span>{onlyNew ? 'Show all posts' : `${newPostsCount} New`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TikTok-style vertical snap feed: one big post at a time */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar px-3 sm:px-6 pb-24"
      >
        {displayedPosts.length === 0 ? (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-8 text-center space-y-4">
              <p className="simple-heading font-bold text-[#000000]">
                You are all caught up!
              </p>
              <p className="simple-body text-[#1D1D1F]">
                There are no new posts since your last visit.
              </p>
              {onlyNew && (
                <button
                  type="button"
                  onClick={() => setOnlyNew(false)}
                  className="min-h-[56px] px-6 rounded-2xl bg-[#0071E3] text-white font-bold text-[20px]"
                >
                  See all family posts
                </button>
              )}
            </div>
          </div>
        ) : (
          displayedPosts.map((post, idx) => {
            const author = users.find((u) => u.id === post.author_id);
            const postIsNew = isPostNew(post, currentUser?.last_seen_at);
            const commentCount = comments.filter(
              (c) => c.post_id === post.id && !c.hidden,
            ).length;

            return (
              <section
                key={post.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                data-index={idx}
                aria-label={`Post ${idx + 1} of ${displayedPosts.length} by ${author?.nickname || 'Family'}`}
                className="snap-start snap-always min-h-full pt-4 pb-24 flex flex-col justify-start max-w-2xl mx-auto"
              >
                <article className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-4 sm:p-6 space-y-4 shadow-xs">
                  {/* Optional Home-screen install card at very top of first post */}
                  {idx === 0 && !onlyNew && <InstallPrompt simple />}

                  {/* Author + Date + New marker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={author} size="lg" />
                      <div>
                        <h2 className="simple-heading font-bold text-[#000000]">
                          {author?.nickname || 'Family'}
                        </h2>
                        <p className="text-[18px] font-medium text-[#1D1D1F]">
                          {formatPostTime(post.created_at)}
                        </p>
                      </div>
                    </div>

                    {postIsNew && (
                      <span className="rounded-full bg-[#5A122C] text-white px-4 py-1.5 text-[18px] font-bold shrink-0">
                        New
                      </span>
                    )}
                  </div>

                  {/* Photo or Video (no text overlaid) */}
                  <MediaCarousel media={post.media} simple />

                  {/* Large readable caption on plain white */}
                  <p className="simple-caption font-medium text-[#000000]">
                    {post.caption}
                  </p>

                  {/* 6 large reaction buttons (emoji + word) */}
                  <ReactionBar post={post} simple />

                  {/* Single clear Comments button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setCommentsPostId(post.id)}
                      className="w-full min-h-[56px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] active:scale-[0.98] text-white font-bold text-[20px] inline-flex items-center justify-center gap-2.5 transition"
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

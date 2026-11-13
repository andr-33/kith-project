import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { isPostNew } from '../utils/validators';
import CommentsPanel from '../components/CommentsPanel';
import PostCard from '../components/PostCard';

export default function FeedView({ onOpenComposer }) {
  const { posts, users, currentUser } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [onlyNew, setOnlyNew] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);

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
                className={`h-[46px] px-4 rounded-2xl font-bold text-[18px] inline-flex items-center gap-2 border transition border-[#5A122C] ${
                  onlyNew
                    ? 'bg-[#5A122C] text-white'
                    : 'bg-[#FFFFFF] text-[#5A122C]'
                }`}
              >
                <span>{onlyNew ? 'Show all posts' : `${newPostsCount} New`}</span>
              </button>
            )}
            {!isSimpleUser && (
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
                <PostCard
                  post={post}
                  onOpenComments={(id) => setCommentsPostId(id)}
                />
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

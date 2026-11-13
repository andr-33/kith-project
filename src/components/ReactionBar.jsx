import { useEffect, useRef, useState } from 'react';
import { Heart, Smile } from 'lucide-react';
import { REACTIONS } from '../utils/validators';
import { useApp } from '../state/AppContext';

export default function ReactionBar({ post, simple = false }) {
  const { reactions, users, currentUser, toggleReaction } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const containerRef = useRef(null);

  const postReactions = reactions.filter((r) => r.post_id === post.id);
  const myReactionKind = postReactions.find((r) => r.user_id === currentUser?.id)?.kind || null;
  const myReactionMeta = REACTIONS.find((r) => r.kind === myReactionKind);
  const isPoster = post.author_id === currentUser?.id;

  // Group reactions by kind to show compact emoji bubbles (e.g. ❤️ 2, 👍 1)
  const groupedReactions = REACTIONS.map((rx) => ({
    ...rx,
    count: postReactions.filter((r) => r.kind === rx.kind).length,
  })).filter((rx) => rx.count > 0);

  const totalCount = postReactions.length;

  // Close picker on click outside
  useEffect(() => {
    if (!pickerOpen) return undefined;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setPickerOpen(false);
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pickerOpen]);

  function handlePick(kind) {
    toggleReaction(post.id, kind);
    setPickerOpen(false);
  }

  const getUserName = (uid) => users.find((u) => u.id === uid)?.nickname || 'Family member';

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2.5">
      {/* Floating iMessage/WhatsApp style Reaction Bar (revealed on button press) */}
      {pickerOpen && (
        <div
          role="dialog"
          aria-label="Choose a reaction"
          className={`absolute left-0 bottom-full mb-3 z-30 flex items-center bg-[#1D1D1F]/95 backdrop-blur-md rounded-full shadow-2xl border border-white/15 px-2.5 py-1.5 transition-all duration-150 animate-in fade-in zoom-in-95 ${
            simple ? 'gap-2 p-2' : 'gap-1.5'
          }`}
        >
          {REACTIONS.map((rx) => {
            const isSelected = myReactionKind === rx.kind;

            return (
              <button
                key={rx.kind}
                type="button"
                onClick={() => handlePick(rx.kind)}
                aria-label={rx.label}
                title={rx.label}
                className={`relative flex items-center justify-center rounded-full transition-transform duration-150 hover:scale-125 active:scale-90 select-none ${
                  simple ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'
                } ${isSelected ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}
              >
                <span>{rx.emoji}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#0071E3]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Single Reaction Action Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Single Reaction Trigger Button */}
        <button
          type="button"
          onClick={() => setPickerOpen((prev) => !prev)}
          aria-expanded={pickerOpen}
          aria-label={myReactionMeta ? `Reacted with ${myReactionMeta.label}. Tap to change.` : 'Add a reaction'}
          className={`inline-flex items-center justify-center gap-2.5 rounded-2xl border font-bold transition active:scale-[0.98] ${
            simple
              ? 'min-h-[56px] px-5 text-[20px]'
              : 'min-h-[42px] px-4 text-sm'
          } ${
            myReactionMeta
              ? 'border-2 border-[#0071E3] bg-[#EAF3FE] text-[#000000]'
              : 'border-[#D2D2D7] bg-[#FFFFFF] text-[#000000] hover:bg-[#F5F5F7]'
          }`}
        >
          {myReactionMeta ? (
            <>
              <span aria-hidden="true" className={simple ? 'text-2xl' : 'text-lg'}>
                {myReactionMeta.emoji}
              </span>
              <span>{myReactionMeta.label}</span>
            </>
          ) : (
            <>
              <Heart className={`${simple ? 'w-6 h-6' : 'w-4 h-4'} text-[#5A122C]`} />
              <span>React</span>
            </>
          )}
        </button>

        {/* Reaction summary bubbles (shows which emojis have been left on this post) */}
        {groupedReactions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowNames((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-2xl border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F5F5F7] px-3 text-[#000000] transition active:scale-[0.98] ${
              simple ? 'min-h-[56px] text-[18px]' : 'min-h-[42px] text-xs'
            }`}
            title="See who reacted"
          >
            <div className="flex items-center -space-x-1">
              {groupedReactions.map((g) => (
                <span key={g.kind} aria-hidden="true" className={simple ? 'text-xl' : 'text-base'}>
                  {g.emoji}
                </span>
              ))}
            </div>
            <span className="font-bold text-[#000000] ml-1">
              {totalCount}
            </span>
          </button>
        )}
      </div>

      {/* Details: Who reacted by name */}
      {postReactions.length > 0 && (isPoster || showNames) && (
        <div
          className={`rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7] px-4 py-2.5 text-[#000000] animate-in fade-in duration-150 ${
            simple ? 'text-[19px]' : 'text-xs'
          }`}
        >
          <span className="font-bold">Reactions: </span>
          {postReactions
            .map((r) => {
              const meta = REACTIONS.find((m) => m.kind === r.kind);
              return `${getUserName(r.user_id)} ${meta?.emoji || ''}`;
            })
            .join(' · ')}
        </div>
      )}
    </div>
  );
}

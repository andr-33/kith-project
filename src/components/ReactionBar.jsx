import { useState } from 'react';
import { REACTIONS } from '../utils/validators';
import { useApp } from '../state/AppContext';

export default function ReactionBar({ post, simple = false }) {
  const { reactions, users, currentUser, toggleReaction } = useApp();
  const [showNames, setShowNames] = useState(false);

  const postReactions = reactions.filter((r) => r.post_id === post.id);
  const myReaction = postReactions.find((r) => r.user_id === currentUser?.id)?.kind || null;
  const isPoster = post.author_id === currentUser?.id;

  const getUserName = (uid) => users.find((u) => u.id === uid)?.nickname || 'Family member';

  return (
    <div className="flex flex-col gap-3">
      <div
        className={
          simple
            ? 'grid grid-cols-2 sm:grid-cols-3 gap-2.5'
            : 'flex flex-wrap items-center gap-2'
        }
      >
        {REACTIONS.map((rx) => {
          const count = postReactions.filter((r) => r.kind === rx.kind).length;
          const active = myReaction === rx.kind;

          return (
            <button
              key={rx.kind}
              type="button"
              onClick={() => toggleReaction(post.id, rx.kind)}
              aria-pressed={active}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold transition active:scale-[0.97] ${
                simple ? 'min-h-[56px] px-3 py-2 text-[20px]' : 'min-h-[44px] px-3.5 py-1.5 text-sm'
              } ${
                active
                  ? 'border-2 border-[#0071E3] bg-[#EAF3FE] text-[#000000]'
                  : 'border-[#D2D2D7] bg-[#FFFFFF] text-[#000000] hover:bg-[#F5F5F7]'
              }`}
            >
              <span aria-hidden="true" className={simple ? 'text-2xl' : 'text-lg'}>
                {rx.emoji}
              </span>
              <span>{rx.label}</span>
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 font-bold ${
                    active ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#000000]'
                  } ${simple ? 'text-[18px] min-w-[28px] h-7' : 'text-xs min-w-[22px] h-5'}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Poster always sees who reacted by name; others can tap to inspect */}
      {postReactions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {!isPoster && !simple && (
            <button
              type="button"
              onClick={() => setShowNames((s) => !s)}
              className="self-start text-sm font-medium text-[#005BB5] hover:underline py-1"
            >
              {showNames
                ? 'Hide who reacted'
                : `See who reacted (${postReactions.length})`}
            </button>
          )}

          {(isPoster || showNames) && (
            <div
              className={`rounded-xl bg-[#F5F5F7] border border-[#D2D2D7] px-3.5 py-2.5 text-[#000000] ${
                simple ? 'text-[19px]' : 'text-sm'
              }`}
            >
              <span className="font-semibold">Reacted: </span>
              {postReactions
                .map((r) => {
                  const meta = REACTIONS.find((m) => m.kind === r.kind);
                  return `${getUserName(r.user_id)} (${meta?.emoji} ${meta?.label})`;
                })
                .join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

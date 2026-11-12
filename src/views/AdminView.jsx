import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Shield,
  Trash2,
  UserX,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { formatPostTime } from '../utils/validators';
import Avatar from '../components/Avatar';

export default function AdminView() {
  const {
    users,
    posts,
    comments,
    invites,
    currentUser,
    createInvite,
    updateMemberSettings,
    resetMemberPin,
    removeMember,
    togglePostHidden,
    deletePost,
    deleteComment,
  } = useApp();

  const [inviteMode, setInviteMode] = useState('simple');
  const [inviteRole, setInviteRole] = useState('member');
  const [copiedCode, setCopiedCode] = useState('');

  const [pinTargetId, setPinTargetId] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const [removeTargetId, setRemoveTargetId] = useState(null);
  const [exportState, setExportState] = useState('');

  function handleCreateInvite() {
    createInvite({ role: inviteRole, screen_mode: inviteMode });
  }

  function copyInvite(code, asLink = false) {
    const text = asLink ? `${window.location.origin}/?invite=${code}` : code;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedCode(`${code}-${asLink ? 'link' : 'code'}`);
    setTimeout(() => setCopiedCode(''), 2000);
  }

  function handlePinReset(e, userId) {
    e.preventDefault();
    const res = resetMemberPin(userId, newPin);
    if (res.error) {
      setPinMessage(res.error);
      return;
    }
    setPinMessage('PIN updated.');
    setNewPin('');
    setTimeout(() => {
      setPinTargetId(null);
      setPinMessage('');
    }, 1200);
  }

  function handleExportAll() {
    setExportState('Preparing family archive...');
    const lines = [
      'Kith&Kin Family Archive Export',
      `Exported at: ${new Date().toLocaleString()}`,
      `Total posts: ${posts.length}`,
      '',
      ...posts.map((p) => {
        const author = users.find((u) => u.id === p.author_id)?.nickname || 'Family';
        const postComments = comments.filter((c) => c.post_id === p.id);
        return [
          `--- ${author} (${p.created_at}) ---`,
          `Caption: ${p.caption}`,
          `Media items: ${p.media.map((m) => `${m.kind}: ${m.url}`).join(', ')}`,
          `Comments (${postComments.length}): ${postComments
            .map((c) => {
              const cAuthor = users.find((u) => u.id === c.author_id)?.nickname || 'Family';
              return `${cAuthor}: "${c.body}"`;
            })
            .join(' | ')}`,
          '',
        ].join('\n');
      }),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kith-and-kin-archive.txt';
    a.click();
    URL.revokeObjectURL(url);
    setExportState('Archive downloaded (kith-and-kin-archive.txt).');
    setTimeout(() => setExportState(''), 3500);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#000000]">
            Family Admin
          </h1>
          <p className="text-sm text-[#1D1D1F]">
            Invitations, screen modes, PIN resets, moderation, and full export.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAll}
          className="min-h-[48px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-semibold px-5 inline-flex items-center gap-2 transition"
        >
          <Download className="w-5 h-5" />
          <span>Export All Photos &amp; Captions</span>
        </button>
      </div>

      {exportState && (
        <div className="rounded-2xl bg-[#EAF3FE] border border-[#0071E3] px-4 py-3 text-sm font-semibold text-[#000000]">
          {exportState}
        </div>
      )}

      {/* 1. Invitations */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#0071E3]" />
          <h2 className="text-xl font-bold text-[#000000]">Invitations (7-day single use)</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-[#F5F5F7] rounded-2xl p-4 border border-[#D2D2D7]">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-semibold text-[#000000] mb-1">
              Starting screen mode
            </span>
            <select
              value={inviteMode}
              onChange={(e) => setInviteMode(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-3 text-sm font-medium text-[#000000]"
            >
              <option value="simple">Simple (for grandparents)</option>
              <option value="full">Full (feed + posting)</option>
            </select>
          </label>

          <label className="flex-1 min-w-[140px]">
            <span className="block text-xs font-semibold text-[#000000] mb-1">
              Role
            </span>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-3 text-sm font-medium text-[#000000]"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleCreateInvite}
            className="min-h-[44px] rounded-xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-semibold px-5 text-sm transition"
          >
            Create Invite
          </button>
        </div>

        <div className="divide-y divide-[#F5F5F7]">
          {invites.map((inv) => {
            const usedUser = inv.used_by ? users.find((u) => u.id === inv.used_by) : null;
            return (
              <div
                key={inv.code}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-base font-bold text-[#000000] bg-[#F5F5F7] px-2.5 py-1 rounded-lg border border-[#D2D2D7]">
                      {inv.code}
                    </code>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#000000]">
                      {inv.screen_mode === 'simple' ? 'Simple Mode' : 'Full Mode'} · {inv.role}
                    </span>
                    {inv.used_by && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3FE] text-[#005BB5]">
                        Used by {usedUser?.nickname || 'Member'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#1D1D1F] mt-1">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>

                {!inv.used_by && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyInvite(inv.code, false)}
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#000000] hover:bg-[#F5F5F7] inline-flex items-center gap-1"
                    >
                      {copiedCode === `${inv.code}-code` ? <Check className="w-3.5 h-3.5 text-[#0071E3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === `${inv.code}-code` ? 'Copied' : 'Copy code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyInvite(inv.code, true)}
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#005BB5] hover:bg-[#EAF3FE] inline-flex items-center gap-1"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{copiedCode === `${inv.code}-link` ? 'Link copied' : 'Copy link'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Family Members */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#0071E3]" />
          <h2 className="text-xl font-bold text-[#000000]">Members ({users.length})</h2>
        </div>

        <div className="space-y-3">
          {users.map((member) => {
            const isSelf = member.id === currentUser?.id;

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-[#D2D2D7] p-4 space-y-3 bg-[#F5F5F7]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={member} size="md" />
                    <div>
                      <div className="font-bold text-base text-[#000000]">
                        {member.nickname} {isSelf ? '(You)' : ''}
                      </div>
                      <div className="text-xs text-[#1D1D1F]">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Screen mode for ${member.nickname}`}
                      value={member.screen_mode}
                      onChange={(e) =>
                        updateMemberSettings(member.id, { screen_mode: e.target.value })
                      }
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-2.5 text-xs font-semibold text-[#000000]"
                    >
                      <option value="simple">Simple mode</option>
                      <option value="full">Full mode</option>
                    </select>

                    <select
                      aria-label={`Role for ${member.nickname}`}
                      value={member.role}
                      disabled={isSelf}
                      onChange={(e) =>
                        updateMemberSettings(member.id, { role: e.target.value })
                      }
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-2.5 text-xs font-semibold text-[#000000] disabled:opacity-60"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setPinTargetId(pinTargetId === member.id ? null : member.id);
                        setNewPin('');
                        setPinMessage('');
                      }}
                      className="min-h-[38px] rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] px-3 text-xs font-semibold text-[#000000] hover:bg-[#E8E8ED] inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset PIN</span>
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setRemoveTargetId(member.id)}
                        className="min-h-[38px] rounded-xl border border-[#5A122C] bg-[#FFFFFF] px-3 text-xs font-semibold text-[#5A122C] hover:bg-[#FDF2F4] inline-flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Reset PIN inline form */}
                {pinTargetId === member.id && (
                  <form
                    onSubmit={(e) => handlePinReset(e, member.id)}
                    className="flex flex-wrap items-center gap-2 bg-[#FFFFFF] rounded-xl p-3 border border-[#D2D2D7]"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="New 6-digit PIN"
                      className="min-h-[40px] rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] px-3 text-sm font-mono text-[#000000]"
                    />
                    <button
                      type="submit"
                      className="min-h-[40px] rounded-xl bg-[#0071E3] text-white font-semibold px-4 text-xs"
                    >
                      Save PIN
                    </button>
                    {pinMessage && (
                      <span className="text-xs font-semibold text-[#5A122C]">{pinMessage}</span>
                    )}
                  </form>
                )}

                {/* Remove person confirmation */}
                {removeTargetId === member.id && (
                  <div className="bg-[#FDF2F4] border border-[#5A122C] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#5A122C]">
                      Remove {member.nickname}? This also deletes all their posts, comments, and photos.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRemoveTargetId(null)}
                        className="min-h-[36px] rounded-lg border border-[#D2D2D7] bg-[#FFFFFF] px-3 text-xs font-semibold text-[#000000]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeMember(member.id);
                          setRemoveTargetId(null);
                        }}
                        className="min-h-[36px] rounded-lg bg-[#5A122C] px-3 text-xs font-semibold text-white"
                      >
                        Remove person
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Post & Comment Moderation */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 sm:p-6 space-y-4">
        <h2 className="text-xl font-bold text-[#000000]">
          Posts &amp; Comments ({posts.length} posts, {comments.length} comments)
        </h2>

        <div className="divide-y divide-[#F5F5F7]">
          {posts.map((post) => {
            const author = users.find((u) => u.id === post.author_id);
            const postComments = comments.filter((c) => c.post_id === post.id);

            return (
              <div key={post.id} className="py-3 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#000000]">
                      {author?.nickname || 'Family'} ·{' '}
                      <span className="font-normal text-[#1D1D1F]">
                        {formatPostTime(post.created_at)}
                      </span>
                      {post.hidden && (
                        <span className="ml-2 text-xs font-bold text-[#5A122C]">[Hidden]</span>
                      )}
                    </div>
                    <p className="text-sm text-[#1D1D1F] truncate">{post.caption}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePostHidden(post.id)}
                      className="min-h-[36px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#000000] hover:bg-[#F5F5F7] inline-flex items-center gap-1"
                    >
                      {post.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{post.hidden ? 'Unhide' : 'Hide'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="min-h-[36px] rounded-xl border border-[#D2D2D7] px-3 text-xs font-semibold text-[#5A122C] hover:bg-[#FDF2F4] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {postComments.length > 0 && (
                  <div className="pl-4 border-l-2 border-[#D2D2D7] space-y-1">
                    {postComments.map((c) => {
                      const cAuthor = users.find((u) => u.id === c.author_id);
                      return (
                        <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[#1D1D1F]">
                            <strong className="text-[#000000]">{cAuthor?.nickname}:</strong> {c.body}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteComment(c.id)}
                            className="text-[#5A122C] font-semibold hover:underline shrink-0"
                          >
                            Delete comment
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

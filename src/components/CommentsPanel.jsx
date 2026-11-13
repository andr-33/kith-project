import { useState } from 'react';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { formatPostTime, MAX_COMMENT_LENGTH } from '../utils/validators';
import Avatar from './Avatar';

export default function CommentsPanel({ post, simple = false, onClose }) {
  const { comments, users, currentUser, addComment, deleteComment } = useApp();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const postComments = comments.filter((c) => c.post_id === post.id && !c.hidden);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    const res = await addComment(post.id, body);
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setBody('');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
      className="fixed inset-0 z-50 bg-[#000000]/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-[#FFFFFF] w-full sm:max-w-xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-[#D2D2D7] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#D2D2D7] bg-[#FFFFFF]">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex items-center h-[44px] rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] text-[#000000] font-semibold px-4 hover:bg-[#E8E8ED] ${
              simple ? 'text-[20px]' : 'text-sm'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className={`font-bold text-[#000000] ${simple ? 'text-[24px]' : 'text-lg'}`}>
            Comments ({postComments.length})
          </h2>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F5F5F7]">
          {postComments.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7] p-6 text-center">
              <p className={`text-[#000000] font-medium ${simple ? 'text-[20px]' : 'text-base'}`}>
                No comments yet. Write the first note!
              </p>
            </div>
          ) : (
            postComments.map((comment) => {
              const author = users.find((u) => u.id === comment.author_id);
              const canDelete =
                comment.author_id === currentUser?.id || currentUser?.role === 'admin';

              return (
                <div
                  key={comment.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar user={author} size={simple ? 'md' : 'sm'} />
                      <div>
                        <div className={`font-bold text-[#000000] ${simple ? 'text-[20px]' : 'text-sm'}`}>
                          {author?.nickname || 'Family member'}
                        </div>
                        <div className={`text-[#1D1D1F] ${simple ? 'text-[17px]' : 'text-xs'}`}>
                          {formatPostTime(comment.created_at)}
                        </div>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteComment(comment.id)}
                        className={`inline-flex items-center rounded-xl border border-[#D2D2D7] h-[38px] px-3 text-[#5A122C] font-semibold hover:bg-[#FDF2F4] ${
                          simple ? 'text-[18px]' : 'text-xs'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className={`text-[#000000] leading-relaxed ${simple ? 'text-[20px]' : 'text-base'}`}>
                    {comment.body}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-[#D2D2D7] bg-[#FFFFFF] space-y-3">
          {error && (
            <p
              role="alert"
              className={`rounded-xl bg-[#FDF2F4] border border-[#5A122C] px-4 py-3 text-[#5A122C] font-semibold ${
                simple ? 'text-[20px]' : 'text-sm'
              }`}
            >
              {error}
            </p>
          )}

          <label className="block">
            <span className={`block font-semibold text-[#000000] mb-1.5 ${simple ? 'text-[20px]' : 'text-sm'}`}>
              Write a comment
            </span>
            <textarea
              rows={2}
              maxLength={MAX_COMMENT_LENGTH}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a warm note..."
              className={`w-full rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 py-3 text-[#000000] placeholder:text-[#3A3A3C] ${
                simple ? 'text-[20px]' : 'text-base'
              }`}
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <span className={`text-[#1D1D1F] ${simple ? 'text-[18px]' : 'text-xs'}`}>
              {body.length} / {MAX_COMMENT_LENGTH}
            </span>

            <button
              type="submit"
              disabled={sending}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] disabled:opacity-50 text-white font-semibold px-6 transition ${
                simple ? 'min-h-[56px] text-[20px]' : 'min-h-[44px] text-sm'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Sending...' : 'Send comment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, Video, X } from 'lucide-react';
import { useApp } from '../state/AppContext';
import {
  MAX_CAPTION_LENGTH,
  MAX_POST_ITEMS,
  MAX_VIDEO_SECONDS,
} from '../utils/validators';

const SAMPLE_LIBRARY = [
  { kind: 'photo', url: '/sample-photos/sunday-garden.jpg', label: 'Garden lunch photo' },
  { kind: 'photo', url: '/sample-photos/coastal-walk.jpg', label: 'Beach walk photo' },
  { kind: 'photo', url: '/sample-photos/apple-pie.jpg', label: 'Apple pie photo' },
  { kind: 'video', url: '/sample-photos/mountain-hike.jpg', durationSeconds: 10, label: '10s Mountain clip' },
];

export default function CreatePostModal({ onClose }) {
  const { createPost } = useApp();

  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [simulateDrop, setSimulateDrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState('');

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');

    const added = [];
    for (const file of files) {
      if (media.length + added.length >= MAX_POST_ITEMS) break;
      const isVideo = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);

      let durationSeconds = 0;
      if (isVideo) {
        durationSeconds = await new Promise((resolve) => {
          const vid = document.createElement('video');
          vid.preload = 'metadata';
          vid.onloadedmetadata = () => resolve(Math.round(vid.duration || 0));
          vid.onerror = () => resolve(0);
          vid.src = objectUrl;
        });
      }

      added.push({
        id: `local-${Date.now()}-${Math.random()}`,
        kind: isVideo ? 'video' : 'photo',
        url: objectUrl,
        durationSeconds,
        alt: file.name,
      });
    }

    setMedia((prev) => [...prev, ...added]);
    e.target.value = '';
  }

  function addSampleItem(sample) {
    if (media.length >= MAX_POST_ITEMS) {
      setError(`You can share up to ${MAX_POST_ITEMS} items in one post.`);
      return;
    }
    setError('');
    setMedia((prev) => [
      ...prev,
      {
        id: `sample-${Date.now()}-${Math.random()}`,
        kind: sample.kind,
        url: sample.url,
        posterUrl: sample.url,
        durationSeconds: sample.durationSeconds,
        alt: sample.label,
      },
    ]);
  }

  function removeItem(id) {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  }

  async function submitPost(e) {
    e?.preventDefault();
    setError('');
    setUploading(true);
    setProgress(0);

    const res = await createPost({
      caption,
      media,
      simulateDrop,
      onProgress: (pct, msg) => {
        setProgress(pct);
        setStatusLabel(msg);
      },
    });

    setUploading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new family post"
      className="fixed inset-0 z-50 bg-[#000000]/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-[#FFFFFF] w-full sm:max-w-xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-[#D2D2D7] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D2D2D7]">
          <h2 className="text-xl font-bold text-[#000000]">Share with Family</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="min-h-[44px] rounded-xl border border-[#D2D2D7] px-3.5 text-sm font-semibold text-[#000000] hover:bg-[#F5F5F7] inline-flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        <form onSubmit={submitPost} className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-[#FDF2F4] border-2 border-[#5A122C] p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-[#5A122C]">{error}</p>
              {error.includes('Retry upload') && (
                <button
                  type="button"
                  onClick={() => {
                    setSimulateDrop(false);
                    submitPost();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#0071E3] text-white font-semibold px-4 text-sm inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry upload</span>
                </button>
              )}
            </div>
          )}

          {/* File picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#000000]">
                Photos or short video ({media.length} / {MAX_POST_ITEMS})
              </span>
              <span className="text-xs text-[#1D1D1F]">
                Max 1 video up to {MAX_VIDEO_SECONDS}s
              </span>
            </div>

            <label className="flex items-center justify-center gap-2 min-h-[56px] rounded-2xl border-2 border-dashed border-[#0071E3] bg-[#F5F5F7] hover:bg-[#EAF3FE] cursor-pointer text-[#005BB5] font-semibold text-base px-4 transition">
              <ImagePlus className="w-5 h-5" />
              <span>Choose photos or a video from your device</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>

            {/* Quick Phase 1 sample selector */}
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-[#1D1D1F]">
                Or pick sample media for quick Phase 1 testing:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_LIBRARY.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => addSampleItem(item)}
                    className="rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F5F5F7] px-3 py-1.5 text-xs font-semibold text-[#000000]"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected thumbnails */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-2xl overflow-hidden border border-[#D2D2D7] bg-[#F5F5F7] aspect-square flex flex-col"
                  >
                    <img
                      src={item.posterUrl || item.url}
                      alt={item.alt || 'Selected item'}
                      className="w-full h-full object-cover"
                    />
                    <div className="bg-[#FFFFFF] border-t border-[#D2D2D7] px-2 py-1 flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#000000] inline-flex items-center gap-1 truncate">
                        {item.kind === 'video' && <Video className="w-3.5 h-3.5 text-[#5A122C]" />}
                        {item.kind === 'video' ? `${item.durationSeconds || 0}s` : 'Photo'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        className="text-[#5A122C] hover:underline text-xs font-semibold inline-flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required Caption */}
          <label className="block space-y-1.5">
            <span className="block font-semibold text-sm text-[#000000]">
              Caption (required)
            </span>
            <textarea
              rows={3}
              maxLength={MAX_CAPTION_LENGTH}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What happened in this moment?"
              className="w-full rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 py-3 text-base text-[#000000]"
            />
            <span className="block text-right text-xs text-[#1D1D1F]">
              {caption.length} / {MAX_CAPTION_LENGTH}
            </span>
          </label>

          {/* Phase 1 test toggle for connection drop */}
          <label className="flex items-center gap-2.5 text-sm text-[#1D1D1F] bg-[#F5F5F7] rounded-xl px-3.5 py-2.5 border border-[#D2D2D7] cursor-pointer">
            <input
              type="checkbox"
              checked={simulateDrop}
              onChange={(e) => setSimulateDrop(e.target.checked)}
              className="w-4 h-4 accent-[#0071E3]"
            />
            <span>Simulate connection drop (tests the Retry upload button)</span>
          </label>

          {/* Upload progress bar */}
          {uploading && (
            <div className="space-y-2 bg-[#F5F5F7] rounded-2xl p-4 border border-[#D2D2D7]">
              <div className="flex items-center justify-between text-sm font-semibold text-[#000000]">
                <span>{statusLabel}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-[#D2D2D7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0071E3] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full min-h-[56px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] disabled:opacity-50 text-white font-bold text-lg transition"
          >
            {uploading ? 'Posting...' : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

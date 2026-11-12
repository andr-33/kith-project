import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Video } from 'lucide-react';

function VideoPlayer({ item, simple }) {
  const isRealVideoFile =
    item.url?.startsWith('blob:') || /\.(mp4|webm|mov)(\?|$)/i.test(item.url || '');

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const total = item.durationSeconds || 12;

  useEffect(() => {
    if (!playing || isRealVideoFile) return undefined;
    const id = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= total) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, total, isRealVideoFile]);

  if (isRealVideoFile) {
    return (
      <div className="bg-[#000000] rounded-2xl overflow-hidden">
        <video
          src={item.url}
          poster={item.posterUrl}
          controls
          playsInline
          className="w-full max-h-[58vh] object-contain mx-auto"
        />
      </div>
    );
  }

  const formatSec = (sec) => `0:${String(sec).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-2xl bg-[#000000] aspect-[4/3] border border-[#D2D2D7]">
        <img
          src={item.posterUrl || item.url}
          alt={item.alt || 'Video preview'}
          className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
            playing ? 'scale-105' : 'scale-100'
          }`}
        />
      </div>

      {/* Controls sit cleanly below the visual — never placed over photos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F5F7] rounded-xl px-4 py-2.5 border border-[#D2D2D7]">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className={`inline-flex items-center gap-2 rounded-xl bg-[#0071E3] hover:bg-[#005BB5] active:scale-[0.98] text-white font-semibold px-4 transition ${
            simple ? 'min-h-[56px] text-[20px]' : 'min-h-[44px] text-base'
          }`}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{playing ? 'Pause video' : 'Play video'}</span>
        </button>

        <div className="flex items-center gap-2 text-[#000000] font-medium">
          <Video className="w-5 h-5 text-[#5A122C]" aria-hidden="true" />
          <span className={simple ? 'text-[20px]' : 'text-sm'}>
            {formatSec(elapsed)} / {formatSec(total)}
          </span>
        </div>

        <div className="w-full h-2 bg-[#D2D2D7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0071E3] transition-all duration-300"
            style={{ width: `${Math.round((elapsed / total) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MediaCarousel({ media = [], simple = false }) {
  const [index, setIndex] = useState(0);

  if (!media.length) return null;

  const safeIndex = Math.min(index, media.length - 1);
  const current = media[safeIndex];
  const hasMany = media.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {current.kind === 'video' ? (
        <VideoPlayer item={current} simple={simple} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7]">
          <img
            src={current.url}
            alt={current.alt || 'Shared family photo'}
            className={`w-full object-cover ${
              simple ? 'h-[36vh] min-h-[240px] max-h-[400px]' : 'aspect-[4/3] max-h-[520px]'
            }`}
          />
        </div>
      )}

      {hasMany && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={safeIndex === 0}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] text-[#000000] font-semibold px-4 disabled:opacity-40 hover:bg-[#F5F5F7] active:scale-[0.98] transition ${
              simple ? 'min-h-[56px] text-[19px] flex-1' : 'min-h-[44px] text-sm'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <span
            className={`font-semibold text-[#000000] px-2 ${
              simple ? 'text-[20px]' : 'text-sm'
            }`}
          >
            {safeIndex + 1} of {media.length}
          </span>

          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(media.length - 1, i + 1))}
            disabled={safeIndex === media.length - 1}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] text-[#000000] font-semibold px-4 disabled:opacity-40 hover:bg-[#F5F5F7] active:scale-[0.98] transition ${
              simple ? 'min-h-[56px] text-[19px] flex-1' : 'min-h-[44px] text-sm'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

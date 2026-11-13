import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Video } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F5F7] rounded-xl px-4 py-2 border border-[#D2D2D7]">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className={`inline-flex items-center gap-2 rounded-xl bg-[#0071E3] hover:bg-[#005BB5] active:scale-[0.98] text-white font-semibold px-4 transition ${
            simple ? 'min-h-[48px] text-[19px]' : 'min-h-[40px] text-sm'
          }`}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{playing ? 'Pause' : 'Play video'}</span>
        </button>

        <div className="flex items-center gap-2 text-[#000000] font-medium">
          <Video className="w-5 h-5 text-[#5A122C]" aria-hidden="true" />
          <span className={simple ? 'text-[18px]' : 'text-sm'}>
            {formatSec(elapsed)} / {formatSec(total)}
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#D2D2D7] rounded-full overflow-hidden">
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
  const scrollRef = useRef(null);

  if (!media.length) return null;
  const hasMany = media.length > 1;

  function handleScroll(e) {
    const el = e.currentTarget;
    const width = el.offsetWidth;
    if (width > 0) {
      const nextIdx = Math.round(el.scrollLeft / width);
      if (nextIdx !== index) {
        setIndex(nextIdx);
      }
    }
  }

  function scrollToIndex(targetIdx) {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: targetIdx * el.offsetWidth, behavior: 'smooth' });
      setIndex(targetIdx);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Horizontal Swipe Snap Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7]"
      >
        {media.map((item, i) => (
          <div
            key={item.id || i}
            className="w-full shrink-0 snap-center overflow-hidden flex items-center justify-center"
          >
            {item.kind === 'video' ? (
              <div className="w-full">
                <VideoPlayer item={item} simple={simple} />
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.alt || 'Shared family photo'}
                className={`w-full object-cover select-none ${
                  simple ? 'h-[36vh] min-h-[220px] max-h-[380px]' : 'aspect-[4/3] max-h-[500px]'
                }`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        ))}
      </div>

      {/* Minimal Dots Indicator (saves ~50px of vertical space on mobile) */}
      {hasMany && (
        <div
          role="tablist"
          aria-label="Photo carousel pagination"
          className="flex items-center justify-center gap-1.5 py-1"
        >
          {media.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Photo ${i + 1} of ${media.length}`}
                onClick={() => scrollToIndex(i)}
                className={`transition-all duration-200 rounded-full ${
                  active
                    ? 'w-4 h-1.5 bg-[#0071E3]'
                    : 'w-1.5 h-1.5 bg-[#D2D2D7] hover:bg-[#86868B]'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

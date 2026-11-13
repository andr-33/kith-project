import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Video } from 'lucide-react';

function VideoPlayer({ item, simple }) {
  const isRealVideoFile =
    item.url?.startsWith('blob:') || /\.(mp4|webm|mov)(\?|$)/i.test(item.url || '');

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const total = item.durationSeconds || 11;

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
      <div className="bg-[#000000] overflow-hidden w-full h-full flex items-center justify-center">
        <video
          src={item.url}
          poster={item.posterUrl}
          controls
          playsInline
          className={`w-full object-cover ${
            simple ? 'h-[36vh] min-h-[220px] max-h-[380px]' : 'aspect-[4/3] max-h-[500px]'
          }`}
        />
      </div>
    );
  }

  const formatSec = (sec) => `0:${String(sec).padStart(2, '0')}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={playing ? 'Pause video' : 'Play video'}
      onClick={() => setPlaying((p) => !p)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setPlaying((p) => !p);
        }
      }}
      className={`relative w-full overflow-hidden bg-[#000000] cursor-pointer select-none group flex items-center justify-center ${
        simple ? 'h-[36vh] min-h-[220px] max-h-[380px]' : 'aspect-[4/3] max-h-[500px]'
      }`}
    >
      <img
        src={item.posterUrl || item.url}
        alt={item.alt || 'Video preview'}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
          playing ? 'scale-105' : 'scale-100 group-hover:scale-102'
        }`}
      />

      {/* Floating center play/pause button (zero vertical space used) */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-[#000000]/65 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/20 transition-transform active:scale-90">
          {playing ? (
            <Pause className="w-7 h-7 fill-white" />
          ) : (
            <Play className="w-7 h-7 fill-white translate-x-0.5" />
          )}
        </div>
      </div>

      {/* Discrete bottom corner duration badge */}
      <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
        <span className="rounded-full bg-[#000000]/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1.5 shadow-sm border border-white/10">
          <Video className="w-3.5 h-3.5 text-white" />
          <span>{playing ? `${formatSec(elapsed)} / ${formatSec(total)}` : formatSec(total)}</span>
        </span>
      </div>

      {/* Subtle bottom progress bar */}
      {playing && (
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/30 overflow-hidden">
          <div
            className="h-full bg-[#0071E3] transition-all duration-300"
            style={{ width: `${Math.round((elapsed / total) * 100)}%` }}
          />
        </div>
      )}
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

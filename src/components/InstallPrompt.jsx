import { useState } from 'react';
import { Smartphone, X } from 'lucide-react';

export default function InstallPrompt({ simple = false }) {
  const [dismissed, setDismissed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#FFFFFF] border border-[#D2D2D7] rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-bold text-[#000000] ${simple ? 'text-[22px]' : 'text-base'}`}>
              Add Kith&amp;Kin to your Home Screen
            </h3>
            <p className={`text-[#1D1D1F] mt-0.5 ${simple ? 'text-[19px]' : 'text-sm'}`}>
              Open your family photos in one tap, just like an app.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss home screen prompt"
          className={`inline-flex items-center gap-1 rounded-xl border border-[#D2D2D7] px-3 text-[#000000] font-semibold hover:bg-[#F5F5F7] shrink-0 ${
            simple ? 'min-h-[56px] text-[18px]' : 'min-h-[40px] text-xs'
          }`}
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>

      {!showSteps ? (
        <button
          type="button"
          onClick={() => setShowSteps(true)}
          className={`self-start rounded-xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-semibold px-5 transition ${
            simple ? 'min-h-[56px] text-[20px]' : 'min-h-[44px] text-sm'
          }`}
        >
          Show me how
        </button>
      ) : (
        <div
          className={`rounded-xl bg-[#F5F5F7] border border-[#D2D2D7] p-4 text-[#000000] space-y-1.5 ${
            simple ? 'text-[19px]' : 'text-sm'
          }`}
        >
          <p className="font-semibold">On iPhone (Safari):</p>
          <p>1. Tap the Share button at the bottom of your screen.</p>
          <p>2. Scroll down and tap &ldquo;Add to Home Screen&rdquo;.</p>
          <p>3. Tap &ldquo;Add&rdquo; in the top corner.</p>
        </div>
      )}
    </div>
  );
}

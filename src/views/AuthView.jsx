import { useEffect, useState } from 'react';
import { Delete, KeyRound, Lock, UserPlus } from 'lucide-react';
import { useApp } from '../state/AppContext';

function PinKeypad({ pin, onChange, large = false }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Back'];

  function handleKey(k) {
    if (k === 'Clear') {
      onChange('');
    } else if (k === 'Back') {
      onChange(pin.slice(0, -1));
    } else if (pin.length < 6) {
      onChange(`${pin}${k}`);
    }
  }

  return (
    <div className="space-y-3">
      {/* 6-digit visual dots */}
      <div className="flex items-center justify-center gap-3 py-2" aria-label={`PIN entered: ${pin.length} of 6 digits`}>
        {[0, 1, 2, 3, 4, 5].map((slot) => {
          const filled = slot < pin.length;
          return (
            <div
              key={slot}
              className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition ${
                filled
                  ? 'border-[#0071E3] bg-[#EAF3FE] text-[#000000]'
                  : 'border-[#D2D2D7] bg-[#F5F5F7] text-[#3A3A3C]'
              }`}
            >
              {filled ? '•' : ''}
            </div>
          );
        })}
      </div>

      {/* Keypad grid with >= 56px touch targets */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKey(k)}
            className={`rounded-2xl border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F5F5F7] active:scale-[0.96] font-bold text-[#000000] transition flex items-center justify-center gap-1 ${
              large ? 'min-h-[60px] text-[22px]' : 'min-h-[56px] text-lg'
            }`}
          >
            {k === 'Back' ? (
              <>
                <Delete className="w-5 h-5" />
                <span className="text-sm font-semibold">Back</span>
              </>
            ) : k === 'Clear' ? (
              <span className="text-sm font-semibold text-[#5A122C]">Clear</span>
            ) : (
              k
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AuthView() {
  const { authScreen, setAuthScreen, loginWithPin, joinWithInvite } = useApp();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Support ?invite=CODE query param automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (code) {
      setInviteCode(code.toUpperCase());
      setAuthScreen('invite');
    }
  }, [setAuthScreen]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginWithPin(email, pin);
    setLoading(false);
    if (res.error) setError(res.error);
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await joinWithInvite({ code: inviteCode, email, nickname, pin });
    setLoading(false);
    if (res.error) setError(res.error);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#000000] text-white text-2xl font-bold tracking-tight">
            K&amp;K
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#000000]">Kith&amp;Kin</h1>
          <p className="text-[19px] text-[#1D1D1F]">
            Your private family circle
          </p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#D2D2D7]">
          <button
            type="button"
            onClick={() => {
              setAuthScreen('login');
              setError('');
              setPin('');
            }}
            className={`min-h-[56px] rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition ${
              authScreen === 'login'
                ? 'bg-[#0071E3] text-white'
                : 'text-[#000000] hover:bg-[#F5F5F7]'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthScreen('invite');
              setError('');
              setPin('');
            }}
            className={`min-h-[56px] rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition ${
              authScreen === 'invite'
                ? 'bg-[#0071E3] text-white'
                : 'text-[#000000] hover:bg-[#F5F5F7]'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span>Join with Invite</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-6 sm:p-7 space-y-5 shadow-xs">
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-[#FDF2F4] border-2 border-[#5A122C] px-4 py-3.5 text-[#5A122C] text-[18px] font-semibold"
            >
              {error}
            </div>
          )}

          {authScreen === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="block text-[18px] font-semibold text-[#000000] mb-1.5">
                  Your email address
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@family.example"
                  className="w-full min-h-[56px] rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 text-[18px] text-[#000000]"
                />
              </label>

              <div>
                <span className="block text-[18px] font-semibold text-[#000000] mb-1">
                  Enter your 6-digit PIN
                </span>
                <PinKeypad pin={pin} onChange={setPin} large />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[56px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] disabled:opacity-50 text-white text-[20px] font-bold transition"
              >
                {loading ? 'Signing in...' : 'Open Family Circle'}
              </button>

              {/* Quick Phase 1 demo helper */}
              <div className="rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7] p-3.5 text-sm text-[#1D1D1F] space-y-1">
                <p className="font-semibold text-[#000000]">Demo accounts (Phase 1):</p>
                <p>Grandparent (Simple): <code>elena@family.example</code> · PIN <code>246810</code></p>
                <p>Admin (Full): <code>andree@family.example</code> · PIN <code>123456</code></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <label className="block">
                <span className="block text-[18px] font-semibold text-[#000000] mb-1.5">
                  Invitation code
                </span>
                <div className="relative flex items-center">
                  <KeyRound className="w-5 h-5 text-[#5A122C] absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="KIN-7429-MAMA"
                    className="w-full min-h-[56px] rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] pl-11 pr-4 text-[18px] font-mono text-[#000000]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-[18px] font-semibold text-[#000000] mb-1.5">
                  Your name or nickname
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Tía Carmen"
                  className="w-full min-h-[56px] rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 text-[18px] text-[#000000]"
                />
              </label>

              <label className="block">
                <span className="block text-[18px] font-semibold text-[#000000] mb-1.5">
                  Your email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carmen@family.example"
                  className="w-full min-h-[56px] rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 text-[18px] text-[#000000]"
                />
              </label>

              <div>
                <span className="block text-[18px] font-semibold text-[#000000] mb-1">
                  Choose a 6-digit PIN
                </span>
                <PinKeypad pin={pin} onChange={setPin} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[56px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] disabled:opacity-50 text-white text-[20px] font-bold transition"
              >
                {loading ? 'Creating your account...' : 'Create My Account'}
              </button>

              <div className="rounded-2xl bg-[#F5F5F7] border border-[#D2D2D7] p-3 text-sm text-[#1D1D1F]">
                <span className="font-semibold text-[#000000]">Demo invite codes: </span>
                <code>KIN-7429-MAMA</code> (Simple) or <code>KIN-8831-TIOC</code> (Full)
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

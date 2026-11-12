import { useState } from 'react';
import { Camera, Check, LogOut, Type } from 'lucide-react';
import { useApp } from '../state/AppContext';
import Avatar from '../components/Avatar';

export default function ProfileView() {
  const { users, currentUser, updateOwnProfile, logout } = useApp();
  const simple = currentUser?.screen_mode === 'simple';

  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const textScaleClass = currentUser?.bigger_text
    ? 'simple-text-bigger'
    : 'simple-text-normal';

  function handleSaveNickname(e) {
    e.preventDefault();
    updateOwnProfile({ nickname });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateOwnProfile({ avatar_url: url });
  }

  return (
    <div
      className={`${simple ? textScaleClass : ''} max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6`}
    >
      <h1 className={simple ? 'simple-heading font-bold text-[#000000]' : 'text-3xl font-bold text-[#000000]'}>
        My Profile
      </h1>

      {/* Own Profile Card */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar user={currentUser} size="xl" />
          <div className="space-y-2">
            <h2 className={simple ? 'simple-heading font-bold text-[#000000]' : 'text-xl font-bold text-[#000000]'}>
              {currentUser?.nickname}
            </h2>
            <p className={simple ? 'simple-body text-[#1D1D1F]' : 'text-sm text-[#1D1D1F]'}>
              {currentUser?.email}
            </p>
            <label
              className={`inline-flex items-center gap-2 rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] hover:bg-[#E8E8ED] cursor-pointer font-semibold text-[#000000] px-4 transition ${
                simple ? 'min-h-[56px] text-[19px]' : 'min-h-[44px] text-sm'
              }`}
            >
              <Camera className="w-5 h-5 text-[#0071E3]" />
              <span>Change photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Edit Nickname */}
        <form onSubmit={handleSaveNickname} className="space-y-3 pt-2 border-t border-[#F5F5F7]">
          <label className="block space-y-1.5">
            <span className={`block font-semibold text-[#000000] ${simple ? 'text-[20px]' : 'text-sm'}`}>
              My display name
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={`w-full rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 text-[#000000] ${
                simple ? 'min-h-[56px] text-[20px]' : 'min-h-[46px] text-base'
              }`}
            />
          </label>

          <button
            type="submit"
            className={`rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-semibold px-6 inline-flex items-center gap-2 transition ${
              simple ? 'min-h-[56px] text-[20px]' : 'min-h-[44px] text-sm'
            }`}
          >
            {savedNotice ? <Check className="w-5 h-5" /> : null}
            <span>{savedNotice ? 'Saved!' : 'Save name'}</span>
          </button>
        </form>

        {/* Bigger text toggle (essential for Simple mode grandparents) */}
        <div className="pt-3 border-t border-[#F5F5F7] flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className={`font-bold text-[#000000] flex items-center gap-2 ${simple ? 'text-[22px]' : 'text-base'}`}>
              <Type className="w-5 h-5 text-[#0071E3]" />
              <span>Bigger text</span>
            </div>
            <p className={simple ? 'simple-body text-[#1D1D1F]' : 'text-sm text-[#1D1D1F]'}>
              Makes captions and buttons larger on Simple screen.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(currentUser?.bigger_text)}
            onClick={() => updateOwnProfile({ bigger_text: !currentUser?.bigger_text })}
            className={`min-h-[56px] rounded-2xl px-5 font-bold transition ${
              simple ? 'text-[20px]' : 'text-sm'
            } ${
              currentUser?.bigger_text
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#F5F5F7] border border-[#D2D2D7] text-[#000000]'
            }`}
          >
            {currentUser?.bigger_text ? 'Bigger text: ON' : 'Bigger text: OFF'}
          </button>
        </div>

        {/* Sign Out */}
        <div className="pt-3 border-t border-[#F5F5F7]">
          <button
            type="button"
            onClick={logout}
            className={`w-full sm:w-auto rounded-2xl border-2 border-[#5A122C] bg-[#FFFFFF] hover:bg-[#FDF2F4] text-[#5A122C] font-bold px-6 inline-flex items-center justify-center gap-2 transition ${
              simple ? 'min-h-[56px] text-[20px]' : 'min-h-[48px] text-sm'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </section>

      {/* Family Circle Directory */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 sm:p-6 space-y-4">
        <h2 className={simple ? 'simple-heading font-bold text-[#000000]' : 'text-xl font-bold text-[#000000]'}>
          Family Circle ({users.length})
        </h2>

        <div className="divide-y divide-[#F5F5F7]">
          {users.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar user={member} size={simple ? 'lg' : 'md'} />
                <div>
                  <div className={`font-bold text-[#000000] ${simple ? 'text-[22px]' : 'text-base'}`}>
                    {member.nickname}
                    {member.id === currentUser?.id ? ' (You)' : ''}
                  </div>
                  <div className={`text-[#1D1D1F] ${simple ? 'text-[18px]' : 'text-xs'}`}>
                    {member.role === 'admin' ? 'Family Admin' : 'Family Member'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

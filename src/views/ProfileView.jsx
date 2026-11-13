import { useState } from 'react';
import { Camera, Check, LogOut, Type } from 'lucide-react';
import { useApp } from '../state/AppContext';
import Avatar from '../components/Avatar';
import InstallPrompt from '../components/InstallPrompt';

export default function ProfileView() {
  const { users, currentUser, updateOwnProfile, logout } = useApp();

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
      className={`${textScaleClass} max-w-md mx-auto px-4 py-5 pb-28 space-y-5`}
    >
      <h1 className="simple-heading font-bold text-[#000000]">
        My Profile
      </h1>

      {/* Install to Home Screen prompt */}
      <InstallPrompt simple />

      {/* Own Profile Card */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar user={currentUser} size="xl" />
          <div className="space-y-1">
            <h2 className="simple-heading font-bold text-[#000000]">
              {currentUser?.nickname}
            </h2>
            <p className="simple-body text-[#1D1D1F]">
              {currentUser?.email}
            </p>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] hover:bg-[#E8E8ED] cursor-pointer font-semibold text-[#000000] px-4 py-2 text-base transition">
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
        <form onSubmit={handleSaveNickname} className="space-y-2.5 pt-3 border-t border-[#F5F5F7]">
          <label className="block space-y-1">
            <span className="block font-bold text-[20px] text-[#000000]">
              Display name
            </span>
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full min-h-[52px] rounded-2xl border border-[#D2D2D7] bg-[#F5F5F7] px-4 text-[19px] text-[#000000]"
              />
              <button
                type="submit"
                className="h-[48px] rounded-2xl bg-[#0071E3] hover:bg-[#005BB5] text-white font-semibold px-5 text-base inline-flex items-center gap-2 transition"
              >
                <span>{savedNotice ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </label>
        </form>

        {/* Bigger text toggle */}
        <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-[20px] text-[#000000] flex items-center gap-2">
              <Type className="w-5 h-5 text-[#0071E3]" />
              <span>Bigger text</span>
            </div>
            <p className="simple-body text-[#1D1D1F]">
              Enlarges captions and text across the app.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(currentUser?.bigger_text)}
            onClick={() => updateOwnProfile({ bigger_text: !currentUser?.bigger_text })}
            className={`min-h-[48px] rounded-2xl px-5 font-bold text-base transition ${currentUser?.bigger_text
              ? 'bg-[#0071E3] text-white'
              : 'bg-[#F5F5F7] border border-[#D2D2D7] text-[#000000]'
              }`}
          >
            {currentUser?.bigger_text ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      {/* Family Circle Directory */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7] p-5 space-y-3 shadow-xs">
        <h2 className="simple-heading font-bold text-[#000000]">
          Family Circle ({users.length})
        </h2>

        <div className="divide-y divide-[#F5F5F7]">
          {users.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar user={member} size="lg" />
                <div>
                  <div className="font-bold text-[20px] text-[#000000]">
                    {member.nickname}
                    {member.id === currentUser?.id ? ' (You)' : ''}
                  </div>
                  <div className="text-[17px] text-[#1D1D1F]">
                    {member.role === 'admin' ? 'Family Admin' : 'Family Member'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Sign Out */}
      <div className="pt-3 border-t border-[#F5F5F7]">
        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[52px] rounded-2xl border border-[#5A122C] bg-[#FFFFFF] hover:bg-[#FDF2F4] text-[#5A122C] font-bold text-[18px] inline-flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

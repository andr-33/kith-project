import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../state/AppContext';

export default function DevRoleBar() {
  const { users, currentUser, switchPreviewUser, setAuthScreen } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#000000] text-white text-xs font-semibold px-3 py-1.5 shadow-md"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview bar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-white px-3 py-2 text-xs border-b border-[#333336]">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-[#F5F5F7] mr-1">Phase 1 Preview:</span>
          {users.map((u) => {
            const active = currentUser?.id === u.id;
            const badge =
              u.role === 'admin'
                ? 'Admin · Full'
                : u.screen_mode === 'simple'
                ? 'Simple'
                : 'Full';

            return (
              <button
                key={u.id}
                type="button"
                onClick={() => switchPreviewUser(u.id)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  active
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#1D1D1F] text-[#F5F5F7] hover:bg-[#333336]'
                }`}
              >
                {u.nickname} ({badge})
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              switchPreviewUser(null);
              setAuthScreen('login');
            }}
            className={`rounded-lg px-2.5 py-1 font-medium transition ${
              !currentUser
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#1D1D1F] text-[#F5F5F7] hover:bg-[#333336]'
            }`}
          >
            Login / Invite
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="inline-flex items-center gap-1 text-[#F5F5F7] hover:text-white px-2 py-1 rounded"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Hide bar</span>
        </button>
      </div>
    </div>
  );
}

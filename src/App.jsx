import { Home, Shield, User } from 'lucide-react';
import { AppProvider, useApp } from './state/AppContext';
import { isPostNew } from './utils/validators';
import DevRoleBar from './components/DevRoleBar';
import AuthView from './views/AuthView';
import SimpleFeedView from './views/SimpleFeedView';
import FullFeedView from './views/FullFeedView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';

function MainShell() {
  const { currentUser, activeTab, navigateTab, posts } = useApp();

  if (!currentUser) {
    return (
      <>
        <DevRoleBar />
        <AuthView />
      </>
    );
  }

  const isSimple = currentUser.screen_mode === 'simple';
  const isAdmin = currentUser.role === 'admin';
  const unreadCount = posts.filter(
    (p) => !p.hidden && isPostNew(p, currentUser.last_seen_at),
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#000000] flex flex-col">
      <DevRoleBar />

      {/* Top brand bar in Full Mode */}
      {!isSimple && (
        <header className="bg-[#FFFFFF] border-b border-[#D2D2D7] sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigateTab('feed')}
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[#000000]"
            >
              <span className="w-9 h-9 rounded-xl bg-[#000000] text-white text-sm font-bold flex items-center justify-center">
                K&amp;K
              </span>
              <span>Kith&amp;Kin</span>
            </button>

            <nav aria-label="Primary navigation" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigateTab('feed')}
                className={`min-h-[44px] rounded-xl px-3.5 text-sm font-semibold inline-flex items-center gap-1.5 transition ${
                  activeTab === 'feed'
                    ? 'bg-[#EAF3FE] text-[#005BB5]'
                    : 'text-[#000000] hover:bg-[#F5F5F7]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Feed</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTab('profile')}
                className={`min-h-[44px] rounded-xl px-3.5 text-sm font-semibold inline-flex items-center gap-1.5 transition ${
                  activeTab === 'profile'
                    ? 'bg-[#EAF3FE] text-[#005BB5]'
                    : 'text-[#000000] hover:bg-[#F5F5F7]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigateTab('admin')}
                  className={`min-h-[44px] rounded-xl px-3.5 text-sm font-semibold inline-flex items-center gap-1.5 transition ${
                    activeTab === 'admin'
                      ? 'bg-[#EAF3FE] text-[#005BB5]'
                      : 'text-[#000000] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'feed' && (isSimple ? <SimpleFeedView /> : <FullFeedView />)}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'admin' && isAdmin && <AdminView />}
      </main>

      {/* Persistent Display Menu at bottom — always available in Simple mode for easy navigation */}
      {isSimple && (
        <nav
          aria-label="Simple navigation menu"
          className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF] border-t border-[#D2D2D7] px-3 py-2 shadow-sm"
        >
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigateTab('feed')}
              className={`min-h-[58px] rounded-2xl font-bold text-[20px] inline-flex items-center justify-center gap-2.5 transition ${
                activeTab === 'feed'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#000000] border border-[#D2D2D7]'
              }`}
            >
              <Home className="w-6 h-6" />
              <span>Feed</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#5A122C] text-white text-[16px] font-bold px-2.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigateTab('profile')}
              className={`min-h-[58px] rounded-2xl font-bold text-[20px] inline-flex items-center justify-center gap-2.5 transition ${
                activeTab === 'profile'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#000000] border border-[#D2D2D7]'
              }`}
            >
              <User className="w-6 h-6" />
              <span>My Profile</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}

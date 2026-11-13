import { useState } from 'react';
import { Home, Shield, User } from 'lucide-react';
import { AppProvider, useApp } from './state/AppContext';
import { isPostNew } from './utils/validators';
import DevRoleBar from './components/DevRoleBar';
import AuthView from './views/AuthView';
import FeedView from './views/FeedView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import CreatePostModal from './views/CreatePostModal';

function MainShell() {
  const { currentUser, activeTab, navigateTab, posts } = useApp();
  const [composerOpen, setComposerOpen] = useState(false);

  if (!currentUser) {
    return (
      <>
        <DevRoleBar />
        <AuthView />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const unreadCount = posts.filter(
    (p) => !p.hidden && isPostNew(p, currentUser.last_seen_at),
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#000000] flex flex-col">
      <DevRoleBar />

      {/* Main Content View (Header is inside FeedView, showing "Family" + New Post or Filter) */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <FeedView onOpenComposer={() => setComposerOpen(true)} />
        )}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'admin' && isAdmin && <AdminView />}
      </main>

      {/* Universal Simple & Clean Bottom Navigation Bar */}
      <nav
        aria-label="App navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#D2D2D7] px-3 py-2 shadow-sm"
      >
        <div
          className={`max-w-md mx-auto grid ${
            isAdmin ? 'grid-cols-3' : 'grid-cols-2'
          } gap-2.5`}
        >
          {/* Feed Tab */}
          <button
            type="button"
            onClick={() => navigateTab('feed')}
            className={`min-h-[54px] rounded-2xl font-bold text-[18px] inline-flex items-center justify-center gap-2 transition ${
              activeTab === 'feed'
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#F5F5F7] text-[#000000] border border-[#D2D2D7]'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Feed</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#5A122C] text-white text-xs font-bold px-2 py-0.5 ml-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => navigateTab('profile')}
            className={`min-h-[54px] rounded-2xl font-bold text-[18px] inline-flex items-center justify-center gap-2 transition ${
              activeTab === 'profile'
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#F5F5F7] text-[#000000] border border-[#D2D2D7]'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span>Profile</span>
          </button>

          {/* Admin Tab (visible only to admins) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateTab('admin')}
              className={`min-h-[54px] rounded-2xl font-bold text-[18px] inline-flex items-center justify-center gap-2 transition ${
                activeTab === 'admin'
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#000000] border border-[#D2D2D7]'
              }`}
            >
              <Shield className="w-5 h-5 shrink-0" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Composer Modal */}
      {composerOpen && <CreatePostModal onClose={() => setComposerOpen(false)} />}
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

export default function Avatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const name = user?.nickname || 'Family';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={`${name}'s profile photo`}
        className={`${sizes[size]} rounded-full object-cover border border-[#D2D2D7] shrink-0 bg-[#FFFFFF]`}
      />
    );
  }

  const bgColor = user?.role === 'admin' ? 'bg-[#0071E3] text-white' : 'bg-[#5A122C] text-white';

  return (
    <div
      aria-hidden="true"
      className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center font-semibold tracking-tight shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}

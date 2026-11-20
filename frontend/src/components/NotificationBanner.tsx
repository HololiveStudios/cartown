import React from 'react';

interface NotificationBannerProps {
  title: string;
  subtitle: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ title, subtitle }) => {
  if (!title) return null;

  return (
    <div className="pointer-events-none self-center bg-slate-900/95 border border-slate-700 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur text-center text-white animate-bounce">
      <div className="font-black text-lg">{title}</div>
      <div className="text-xs text-slate-300">{subtitle}</div>
    </div>
  );
};

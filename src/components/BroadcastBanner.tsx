import React, { useState } from 'react';
import { Megaphone, X, Bell } from 'lucide-react';
import { BroadcastNotification } from '../types';

interface BroadcastBannerProps {
  notification: BroadcastNotification;
  isArabic: boolean;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ notification, isArabic }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!notification.enabled || !notification.message || dismissed) return null;

  const bgStyle =
    notification.type === 'urgent'
      ? 'bg-red-700 text-white'
      : notification.type === 'alert'
      ? 'bg-amber-600 text-white'
      : 'bg-neutral-900 text-white border-b border-neutral-800';

  return (
    <div className={`w-full py-2 px-3 sm:px-4 text-xs font-semibold ${bgStyle} transition duration-200 z-40 relative flex items-center justify-between`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 rtl:space-x-reverse text-center flex-1 pr-6 rtl:pr-0 rtl:pl-6">
        <Bell className="w-3.5 h-3.5 shrink-0 animate-bounce text-amber-400" />
        <span className="truncate sm:overflow-visible sm:whitespace-normal font-bold">
          {isArabic && notification.message ? notification.message : notification.messageEn || notification.message}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/20 rounded transition text-neutral-300 hover:text-white cursor-pointer shrink-0"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

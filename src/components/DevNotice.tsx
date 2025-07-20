
import React from 'react';

interface DevNoticeProps {
  children: React.ReactNode;
}

export const DevNotice: React.FC<DevNoticeProps> = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-xs shadow-lg z-50 max-w-xs">
        <div className="font-semibold">Development Mode</div>
        <div>This is a demo version of OneMedi Admin</div>
      </div>
    </div>
  );
};

import type { ReactNode } from 'react';

export default function ToolbarWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        margin: '8px 0 12px 0',
        padding: '6px 12px',
        backgroundColor: '#263545',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </div>
  );
}

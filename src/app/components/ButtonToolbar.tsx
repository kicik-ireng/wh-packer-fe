import type { ReactNode } from 'react';

export default function ButtonToolbar({
  title,
  icon,
  onClick,
  enable = true,
  loading = false,
  danger = false,
}: {
  title: string;
  icon?: ReactNode;
  onClick?: () => void;
  enable?: boolean;
  loading?: boolean;
  danger?: boolean;
}) {
  const isInteractive = enable && !loading;

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '4px',
        border: 'none',
        background: isInteractive
          ? danger
            ? '#ef4444'
            : 'rgba(255, 255, 255, 0.1)'
          : 'transparent',
        color: !isInteractive
          ? 'rgba(255, 255, 255, 0.35)'
          : danger
            ? '#ffffff'
            : '#ffffff',
        cursor: isInteractive ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s',
      }}
      className={isInteractive ? 'hover:bg-slate-600 active:scale-95' : ''}
    >
      {loading ? <span className="animate-spin inline-block">◌</span> : icon}
      <span>{title}</span>
    </button>
  );
}

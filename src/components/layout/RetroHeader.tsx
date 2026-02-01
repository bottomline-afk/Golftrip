import { useNavigate } from 'react-router-dom';

interface RetroHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
}

function RetroHeader({ title, showBack = false, backTo }: RetroHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="flex items-center gap-3 px-4 py-4 bg-surface/80 border-b border-surface-light safe-top">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="text-dim-white hover:text-neon-cyan transition-colors duration-150 p-1 cursor-pointer"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <h1 className="font-heading text-sm text-neon-cyan glow-cyan truncate">
        {title}
      </h1>
    </header>
  );
}

export default RetroHeader;

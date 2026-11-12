import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useVault();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--emerald-500)';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--rose-500)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--blue-500)';
        }

        return (
          <div key={toast.id} className="toast-item">
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Dismiss toast"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};


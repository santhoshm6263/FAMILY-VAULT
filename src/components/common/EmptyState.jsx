import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--slate-200)',
        margin: '16px 0'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', maxWidth: '400px', marginBottom: '20px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" icon={ActionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};


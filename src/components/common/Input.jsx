import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`fv-input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="fv-label">
          {label} {required && <span style={{ color: 'var(--rose-500)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="fv-input"
          style={{
            paddingLeft: Icon ? '38px' : '14px',
            borderColor: error ? 'var(--rose-500)' : undefined
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};


import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      {label && (
        <label style={{ fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '1rem',
          outline: 'none',
        }}
      />
    </div>
  );
};
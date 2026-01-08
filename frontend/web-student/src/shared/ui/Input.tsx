import '@/styles/components/Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="input-wrapper">
      <label className="input-label">
        {label}
      </label>
      <input
        {...props}
        className={`input-field ${className} ${error ? 'input-error' : ''}`}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
}

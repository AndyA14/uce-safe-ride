interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
  }
  
  export default function Input({ label, ...props }: Props) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          {label}
        </label>
        <input
          {...props}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: '#020617',
            color: 'white',
          }}
        />
      </div>
    );
  }
  
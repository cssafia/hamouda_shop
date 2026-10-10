export default function Input({ label, error, id, ...props }) {
  return (
    <div>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="input" {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

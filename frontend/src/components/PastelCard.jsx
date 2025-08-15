export default function PastelCard({ children, className = '' }) {
  return (
    <div className={`bg-sky-200 border border-sky-300 rounded-xl shadow ${className}`}>
      {children}
    </div>
  );
}

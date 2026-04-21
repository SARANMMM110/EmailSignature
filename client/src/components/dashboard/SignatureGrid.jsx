import { SignatureCard } from './SignatureCard.jsx';

export function SignatureGrid({ signatures = [], showToast, onDeleted, onRenamed, onDuplicated }) {
  const count = signatures.length;
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      {signatures.map((sig) => (
        <SignatureCard
          key={sig.id}
          signature={sig}
          signatureCount={count}
          showToast={showToast}
          onDeleted={onDeleted}
          onRenamed={onRenamed}
          onDuplicated={onDuplicated}
        />
      ))}
    </div>
  );
}

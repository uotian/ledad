export function Message({ error, message }: { error: string | null; message: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-white/50">
        {message}
      </p>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

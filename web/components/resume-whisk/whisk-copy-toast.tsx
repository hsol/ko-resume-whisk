export function WhiskCopyToast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
      <p
        role="status"
        aria-live="polite"
        className="max-w-sm rounded-full bg-[#1a1f2c] px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg"
      >
        {message}
      </p>
    </div>
  );
}

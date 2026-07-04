export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-md opacity-80" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Loading</p>
      </div>
    </div>
  );
}

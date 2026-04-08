export function QuestionCardSkeleton() {
  return (
    <div className="question-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg skeleton" />
          <div className="flex flex-col gap-2 pt-1 flex-1">
            <div className="skeleton h-[11px] w-24 rounded" />
            <div className="skeleton h-[14px] w-full rounded" />
            <div className="skeleton h-[14px] w-[85%] rounded" />
            <div className="skeleton h-[14px] w-[55%] rounded" />
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg skeleton" />
      </div>
    </div>
  );
}
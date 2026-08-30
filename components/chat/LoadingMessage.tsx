export function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
        <span>Escribiendo</span>
        <span className="flex gap-0.5">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce [animation-delay:150ms]">.</span>
          <span className="animate-bounce [animation-delay:300ms]">.</span>
        </span>
      </div>
    </div>
  )
}

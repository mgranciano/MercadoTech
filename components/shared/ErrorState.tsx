import { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title: string
  description?: string
  details?: string
  onRetry?: () => void
  action?: ReactNode
  className?: string
}

export function ErrorState({
  title,
  description,
  details,
  onRetry,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 text-destructive">
        <AlertTriangle size={48} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {details && (
        <div className="mt-3 rounded-md bg-destructive/5 p-3 text-xs text-destructive font-mono max-w-sm text-left">
          {details}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Reintentar
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}

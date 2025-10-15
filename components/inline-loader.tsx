import { GooeyLoader } from "@/components/ui/loader-10"

interface InlineLoaderProps {
  message?: string
}

export function InlineLoader({ message }: InlineLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <GooeyLoader className="scale-75" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}


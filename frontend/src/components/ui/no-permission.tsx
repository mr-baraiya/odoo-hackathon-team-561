import type React from "react"
import { LockKeyhole } from "lucide-react"

interface NoPermissionProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function NoPermission({
  title = "Access Restricted",
  message = "You don't have permission to view this content.",
  icon = <LockKeyhole className="h-12 w-12 text-blue-600" />,
}: NoPermissionProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-4">
      <div className="flex flex-col items-center max-w-md text-center">
        {icon}
        <h2 className="mt-6 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}


import { Wallet } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Wallet className="h-6 w-6 text-primary" />
      <span className="font-extrabold text-2xl text-primary">
        <span className="text-secondary-foreground">The</span>Bank
      </span>
    </div>
  )
}


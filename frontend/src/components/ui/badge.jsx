import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
        secondary:   'border-white/10 bg-white/5 text-gray-300',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
        success:     'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        warning:     'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
        purple:      'border-purple-500/30 bg-purple-500/10 text-purple-400',
        outline:     'border-white/20 text-gray-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

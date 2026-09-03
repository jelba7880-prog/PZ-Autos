'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'

export function Command({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn('flex flex-col overflow-hidden rounded-lg font-body text-sm text-ink', className)}
      {...props}
    />
  )
}

export function CommandInput(props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b border-hairline px-3">
      <CommandPrimitive.Input
        className="flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-text-muted disabled:opacity-60"
        {...props}
      />
    </div>
  )
}

export function CommandList(props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className="max-h-64 overflow-y-auto overflow-x-hidden p-1" {...props} />
}

export function CommandEmpty(props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm text-text-muted" {...props} />
}

export function CommandGroup(props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className="text-ink" {...props} />
}

export function CommandItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-bg-base',
        className
      )}
      {...props}
    />
  )
}

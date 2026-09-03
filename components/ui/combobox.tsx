'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  emptyText?: string
  disabled?: boolean
}

// Searchable combobox that always allows free entry — inventory here is
// broker-sourced and not limited to `options`, so typing a value that
// doesn't match anything is a valid, first-class action ("Use <value>"),
// not an error state.
export function Combobox({ name, value, onChange, options, placeholder, emptyText = 'No matches', disabled }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.toLowerCase().includes(q))
  }, [options, query])

  const exactMatch = options.some((opt) => opt.toLowerCase() === query.trim().toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Hidden field so this participates in plain FormData submits. */}
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink text-left disabled:opacity-60',
            !value && 'text-text-muted'
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
          />
          <CommandList>
            {filtered.length === 0 && query.trim() === '' && <CommandEmpty>{emptyText}</CommandEmpty>}
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt)
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt ? 'opacity-100' : 'opacity-0')} />
                  {opt}
                </CommandItem>
              ))}
              {query.trim() !== '' && !exactMatch && (
                <CommandItem
                  value={`__custom__${query}`}
                  onSelect={() => {
                    onChange(query.trim())
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  Use &ldquo;{query.trim()}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'

export interface CityItem {
  id: string
  city: string
  country: string | null
  code: string
  note: string | null
}

interface CitySearchProps {
  items: CityItem[]
  value: string
  onSelect: (item: CityItem) => void
  placeholder?: string
  label?: string
}

function useOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onClose])
}

export function CitySearch({ items, value, onSelect, placeholder = 'Search cities...', label }: CitySearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedItem = items.find(i => i.id === value || i.city === value)

  const filtered = query.length > 0
    ? items.filter(i =>
        i.city.toLowerCase().includes(query.toLowerCase()) ||
        i.code.toLowerCase().includes(query.toLowerCase()) ||
        (i.country?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : items.slice(0, 8)

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setQuery('')
    setHighlightedIndex(-1)
  }, [])

  useOutside(ref, closeDropdown)

  function handleSelect(item: CityItem) {
    onSelect(item)
    closeDropdown()
    inputRef.current?.blur()
  }

  function handleFocus() {
    setOpen(true)
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        closeDropdown()
        inputRef.current?.blur()
        break
    }
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement
      highlighted?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const displayValue = query.length > 0
    ? query
    : selectedItem
      ? `${selectedItem.city} (${selectedItem.code})`
      : ''

  return (
    <div className="city-search" ref={ref}>
      <div className="city-search-input-wrap">
        <Search size={16} className="city-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="city-search-input"
          placeholder={placeholder}
          value={displayValue}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          aria-label={label ?? 'Search city'}
          aria-expanded={open}
          role="combobox"
          aria-autocomplete="list"
        />
        {selectedItem && query.length === 0 && (
          <button
            type="button"
            className="city-search-clear"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="city-search-dropdown" ref={listRef} role="listbox">
          {filtered.map((item, idx) => (
            <button
              key={`${item.id}-${item.code}`}
              type="button"
              className={`city-search-item${item.id === value || item.city === value ? ' on' : ''}${idx === highlightedIndex ? ' highlighted' : ''}`}
              onClick={() => handleSelect(item)}
              role="option"
              aria-selected={item.id === value || item.city === value}
            >
              <span className="city-search-item-text">
                <span className="city-search-item-city">{item.city}</span>
                {item.country && <span className="city-search-item-country">{item.country}</span>}
              </span>
              <span className="city-search-code">{item.code}</span>
            </button>
          ))}
          {query.length === 0 && items.length > 8 && (
            <div className="city-search-hint">Type to search more cities…</div>
          )}
        </div>
      )}
      {open && filtered.length === 0 && query.length > 0 && (
        <div className="city-search-dropdown">
          <div className="city-search-empty">No cities found</div>
        </div>
      )}
    </div>
  )
}

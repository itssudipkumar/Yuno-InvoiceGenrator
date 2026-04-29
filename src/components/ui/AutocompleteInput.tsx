import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Generic Autocomplete Input ───────────────────────────
interface AutocompleteOption {
  label: string
  sublabel?: string
  value: string
}

interface AutocompleteInputProps {
  value: string
  onChange: (val: string) => void
  onSelect: (val: string, option?: AutocompleteOption) => void
  options?: AutocompleteOption[]
  placeholder?: string
  label?: string
  fetchOptions?: (q: string) => Promise<string[]>
  debounceMs?: number
  minChars?: number
}

export function AutocompleteInput({
  value, onChange, onSelect, options, placeholder,
  fetchOptions, debounceMs = 400, minChars = 3
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
  const [show, setShow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!value.trim()) { setSuggestions([]); setShow(false); return }

    // Static options filter
    if (options) {
      const q = value.toLowerCase()
      const matches = options.filter(o =>
        o.label.toLowerCase().includes(q) || (o.sublabel || '').toLowerCase().includes(q)
      ).slice(0, 6)
      setSuggestions(matches)
      setShow(matches.length > 0)
      return
    }

    // Async fetch (e.g. Nominatim)
    if (fetchOptions && value.length >= minChars) {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          const results = await fetchOptions(value)
          const opts = results.map(r => ({ label: r, value: r }))
          setSuggestions(opts)
          setShow(opts.length > 0)
        } catch { setSuggestions([]); setShow(false) }
      }, debounceMs)
    }
  }, [value, options])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShow(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {show && suggestions.length > 0 && (
        <div className="autocomplete-drop">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="autocomplete-item"
              onMouseDown={e => { e.preventDefault(); onSelect(s.value, s); setShow(false) }}
            >
              <span className="ac-name">{s.label}</span>
              {s.sublabel && <span className="ac-sub">{s.sublabel}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Address Autocomplete (Nominatim AU) ──────────────────
export function useAddressAutocomplete() {
  const fetchAddresses = useCallback(async (q: string): Promise<string[]> => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=5&q=${encodeURIComponent(q)}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data: Array<{ display_name: string }> = await res.json()
    return data.map(d => d.display_name)
  }, [])
  return fetchAddresses
}

import type { Language } from '../../../constants/languages'

interface LanguageSelectorProps {
  value: string
  languages: Language[]
  onChange: (value: string) => void
}

export default function LanguageSelector({
  value,
  onChange,
  languages,
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="language-select"
        className="text-sm font-semibold text-github-text tracking-tight"
      >
        Language
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            px-3 py-2 pr-10
            text-sm font-normal
            text-github-text
            bg-white
            border border-github-border
            rounded-md
            cursor-pointer
            appearance-none
            transition-all duration-150
            hover:border-github-border-hover
            hover:bg-github-bg-subtle
            focus:outline-none
            focus:border-github-blue
            focus:ring-2
            focus:ring-github-blue/20
            active:bg-gray-50
          "
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.icon} {lang.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-github-text-secondary"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

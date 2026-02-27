import './LanguageSelector.css'

interface LanguageSelectorProps {
  value: string
  languages: any
  onChange: (value: string) => void
}

export default function LanguageSelector({
  value,
  onChange,
  languages,
}: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-selector__label">
        Language
      </label>
      <div className="language-selector__wrapper">
        <select
          id="language-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="language-selector__select"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.icon} {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

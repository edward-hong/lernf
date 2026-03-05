interface ModelSelectorProps {
  availableModels: string[];
  selectedModel: string;
  onChange: (model: string) => void;
}

export function ModelSelector({
  availableModels,
  selectedModel,
  onChange,
}: ModelSelectorProps) {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {availableModels.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}

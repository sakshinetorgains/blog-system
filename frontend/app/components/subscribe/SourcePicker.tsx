"use client";

type Props = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export default function SourcePicker({ value, options, onChange }: Props) {
  return (
    <select
      className="border p-2 w-full mb-4 bg-blue-100 text-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-gray-500">
          {opt}
        </option>
      ))}
    </select>
  );
}


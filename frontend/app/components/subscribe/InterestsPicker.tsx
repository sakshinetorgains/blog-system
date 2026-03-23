"use client";

type Props = {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
};

export default function InterestsPicker({ items, selected, onToggle }: Props) {
  return (
    <div className="mb-4">
      {items.map((item) => (
        <label key={item} className="block text-gray-500">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
          />
          <span className="ml-2">{item}</span>
        </label>
      ))}
    </div>
  );
}


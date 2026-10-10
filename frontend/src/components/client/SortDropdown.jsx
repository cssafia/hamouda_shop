import Select from '../ui/Select.jsx';
import { SORT_OPTIONS } from '../../constants/product.js';

export default function SortDropdown({ value, onChange }) {
  return (
    <Select value={value || 'newest'} onChange={(e) => onChange(e.target.value)} aria-label="Trier les produits">
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
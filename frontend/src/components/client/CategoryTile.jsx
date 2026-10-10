import { Link } from 'react-router-dom';
import { LuLaptop, LuSmartphone, LuMouse, LuPackage } from 'react-icons/lu';

const ICON_MAP = {
  laptop: LuLaptop,
  laptops: LuLaptop,
  'pc portable': LuLaptop,
  phone: LuSmartphone,
  phones: LuSmartphone,
  accessoire: LuMouse,
  accessoires: LuMouse,
};

function getIcon(name = '') {
  return ICON_MAP[name.trim().toLowerCase()] || LuPackage;
}

// NOTE: brand doc wants a real product photo here, not an icon.
// useCategories() only returns { id, name } today — no image field.
// Swap the icon block below for an <img src={image}> once the backend adds one.
export default function CategoryTile({ id, name, image }) {
  const Icon = getIcon(name);

  return (
    <Link
      to={`/products?category=${id}`}
      className="group block bg-white border border-surface-border rounded-card overflow-hidden hover:border-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      <div className="aspect-square bg-surface-subtle flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <Icon size={28} className="text-brand-600" aria-hidden="true" />
        )}
      </div>
      <div className="p-3 text-center">
        <p className="text-sm font-medium text-ink-900">{name}</p>
        <span className="text-xs text-brand-600 group-hover:underline">Voir les produits →</span>
      </div>
    </Link>
  );
}
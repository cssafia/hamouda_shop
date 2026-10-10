import Sheet from '../ui/Sheet.jsx';
import Button from '../ui/Button.jsx';

export default function FilterSheet({ open, onClose, resultCount, children }) {
  return (
    <Sheet open={open} onClose={onClose} title="Filtres">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        <div className="sticky bottom-0 bg-white border-t border-surface-border p-4">
          <Button onClick={onClose} className="w-full">
            {resultCount != null ? `Voir ${resultCount} résultats` : 'Appliquer'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
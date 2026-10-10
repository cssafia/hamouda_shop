import { LuPackage } from 'react-icons/lu';
import Skeleton from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ScrollableRow from './ScrollableRow.jsx';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({
  products = [],
  isLoading,
  isError,
  renderItem = (product) => <ProductCard product={product} />,
  emptyTitle = 'Pas encore de produits',
  emptyDescription = 'Reviens bientôt.',
}) {
  if (isLoading) {
    return (
      <ScrollableRow showArrows={false}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[170px] sm:w-[220px] lg:w-[260px] shrink-0 snap-start">
            <Skeleton className="aspect-square rounded-card w-full" />
            <Skeleton className="h-4 w-3/4 mt-3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        ))}
      </ScrollableRow>
    );
  }

  if (isError || products.length === 0) {
    return <EmptyState icon={LuPackage} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ScrollableRow ariaLabelPrev="Produits précédents" ariaLabelNext="Produits suivants">
      {products.map((product) => (
        <div key={product.id} className="w-[170px] sm:w-[220px] lg:w-[260px] shrink-0 snap-start">
          {renderItem(product)}
        </div>
      ))}
    </ScrollableRow>
  );
}
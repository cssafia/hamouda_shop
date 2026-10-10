import StatusPill from '../ui/StatusPill.jsx';

export default function StockPill({ availability }) {
  const isAvailable = availability === 'available';

  return (
    <StatusPill tone={isAvailable ? 'success' : 'danger'}>
      ● {isAvailable ? 'En stock' : 'Rupture'}
    </StatusPill>
  );
}
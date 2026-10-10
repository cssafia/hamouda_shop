import { useLocation } from 'react-router-dom';
import { LuMessageCircle } from 'react-icons/lu';
import { WHATSAPP_NUMBER } from '../../constants/config.js';

export default function WhatsAppFloat() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je voudrais des infos sur...')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter via WhatsApp"
      className="fixed right-4 z-50 w-14 h-14 rounded-full
                 bg-[#25D366] text-white shadow-lg flex items-center justify-center
                 hover:scale-105 active:scale-95 transition-transform
                 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)]"
    >
      <LuMessageCircle size={24} />
    </a>
  );
}
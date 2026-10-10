import { LuExternalLink } from 'react-icons/lu';
import { FACEBOOK_URL } from '../../constants/config.js';

// No API fetches a real FB post for v1 — drop a real screenshot of a genuine
// post/review at public/social-proof.jpg and it renders here. This is
// intentionally NOT a fake testimonial card, per the brand doc.
export default function SocialProofSection() {
  return (
    <section aria-labelledby="social-proof-heading" id="social-proof" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div className="aspect-[4/3] bg-surface-subtle border border-surface-border rounded-card overflow-hidden">
          <img
            src="/social-proof.jpg"
            alt="Avis client réel sur Facebook"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 id="social-proof-heading" className="text-2xl lg:text-3xl font-semibold text-ink-900">
            قبل ما تشري، شوف واش قالو الناس
          </h2>
          <p className="text-ink-600 mt-3">آراء الزبائن الحقيقيين على صفحتنا Facebook</p>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-5 inline-flex items-center gap-2"
          >
            شوف واش قالو علينا
            <LuExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
// src/components/PartnersMarquee.jsx
import { partners } from './partners.data'

export default function PartnersMarquee() {
  const track = [...partners, ...partners]

  return (
    <section className="bg-white py-10">
      {/* match this max-w + px to whatever your blog section uses */}
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <h2 className="mb-6 text-sm font-semibold text-gray-900">
          Trusted Partners
        </h2>

        {/* clipping now happens at the container edge, not the screen edge */}
        <div className="overflow-hidden">
          <div className="flex w-max animate-scroll gap-16">
            {track.map((partner, i) => (
              <img
                key={`${partner.name}-${i}`}
                src={partner.logo}
                alt={partner.name}
                className="h-10 w-auto shrink-0 object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
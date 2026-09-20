// src/components/PartnersMarquee.jsx
import { partners } from './partners.data'

export default function PartnersMarquee() {
  // Render the list twice so the loop can wrap seamlessly (see Step 1)
  const track = [...partners, ...partners]

  return (
    <section className="overflow-hidden bg-white py-10">
      <h2 className="mb-6 px-6 text-sm font-semibold text-gray-900 md:px-12">
        Trusted Partners
      </h2>

      <div className="flex w-max animate-scroll gap-16 px-6 md:px-12">
        {track.map((partner, i) => (
          <img
            key={`${partner.name}-${i}`}
            src={partner.logo}
            alt={partner.name}
            className="h-10 w-auto shrink-0 object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
          />
        ))}
      </div>
    </section>
  )
}
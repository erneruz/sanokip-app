
import { partners } from './partners.data'

export default function PartnersMarquee() {
  const track = [...partners, ...partners]

  return (
    <section className="bg-gray-100 py-5 border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="mb-6 text-sm font-semibold text-gray-900">
                Trusted Partners
            </h2>

            <div className="overflow-hidden">
                <div className="flex w-max animate-scroll gap-16">
                    {track.map((partner, i) => (
                        <a
                            key={`${partner.name}-${i}`}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-16 w-auto shrink-0 object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
                                >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-16 w-auto object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
                                />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </section>
  )
}



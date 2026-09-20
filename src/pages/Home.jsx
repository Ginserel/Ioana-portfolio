import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CATEGORY_LABELS } from '../lib/categories'
import ProjectFrame from '../components/ProjectFrame'

function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching featured projects:', error)
      } else {
        setFeatured(data)
      }
      setLoading(false)
    }

    fetchFeatured()
  }, [])

  // The first featured project (lowest order_index) gets the full-width frame,
  // everything after it goes into the grid.
  const [lead, ...rest] = featured

  return (
    <div>
      {/* HERO */}
      <section className="px-6 md:px-10 pt-14 md:pt-24 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1400px] grid gap-10 md:grid-cols-12 md:gap-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-6 md:mb-8">
              Ioana Dobrin — graphic designer &amp; fine artist
            </p>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.92] tracking-tight">
              Pattern, print &amp;{' '}
              <em className="italic text-accent">paint.</em>
            </h1>
          </div>

          <div className="md:col-span-5 md:pb-3">
            <p className="max-w-sm text-neutral-600 leading-relaxed">
              Surface design for fashion licensing, identities and layouts for
              print, illustration, and paintings made by hand. Four disciplines
              that keep borrowing from each other.
            </p>
            <Link
              to="/gallery"
              className="group mt-7 inline-flex items-center gap-2 text-sm text-accent"
            >
              <span className="border-b border-accent/40 pb-1 transition-colors group-hover:border-accent">
                View selected work
              </span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* LEAD PROJECT - one large frame */}
      {lead && (
        <section className="px-6 md:px-10 pb-14 md:pb-20">
          <div className="mx-auto max-w-[1400px]">
            <ProjectFrame
              project={lead}
              height="h-[420px] sm:h-[520px] md:h-[640px]"
              titleSize="text-2xl md:text-4xl"
            />
          </div>
        </section>
      )}

      {/* THE REST OF THE FEATURED WORK - 3 columns, then 2, then 1 on mobile */}
      <section className="px-6 md:px-10 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1400px] grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <ProjectFrame key={project.id} project={project} height="h-[380px]" />
          ))}

          {/* Closing tile - same frame shape, sends visitors to the full gallery */}
          <Link to="/gallery" className="group block">
            <div className="h-[380px] bg-panel flex flex-col items-center justify-center px-6 text-center transition-colors group-hover:bg-[#e5d8c4]">
              <span className="font-display text-3xl md:text-4xl">See all work</span>
              <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-accent">
                Gallery
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl md:text-2xl group-hover:text-accent transition-colors">
                The full archive
              </h3>
              <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500">
                Every category
              </span>
            </div>
          </Link>
        </div>

        {loading && (
          <p className="mx-auto max-w-[1400px] mt-8 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
            Loading work…
          </p>
        )}
      </section>

      {/* FOUR WAYS IN - one row per category, straight into the filtered gallery */}
      <section className="px-6 md:px-10 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-3xl md:text-5xl mb-8 md:mb-10">
            Four ways in
          </h2>
          <ul className="border-t border-neutral-900/10">
            {/* Object.entries turns CATEGORY_LABELS into [key, label] pairs */}
            {Object.entries(CATEGORY_LABELS).map(([value, label], index) => (
              <li key={value} className="border-b border-neutral-900/10">
                <Link
                  to={`/gallery?category=${value}`}
                  className="group flex items-baseline justify-between gap-6 py-5 md:py-7"
                >
                  <span className="flex items-baseline gap-4 md:gap-10">
                    <span className="text-[0.7rem] tracking-[0.25em] text-neutral-400">
                      0{index + 1}
                    </span>
                    <span className="font-display text-2xl md:text-4xl transition-colors group-hover:text-accent">
                      {label}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-accent transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Home

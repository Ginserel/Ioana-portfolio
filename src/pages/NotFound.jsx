import { Link } from 'react-router-dom'

// Anything that isn't a real route lands here instead of a blank page
function NotFound() {
  return (
    <div className="px-6 md:px-10 pt-10 md:pt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-5 md:mb-6">
          Error 404
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Nothing <em className="italic text-accent">here.</em>
        </h1>
        <p className="max-w-sm text-lg text-neutral-600 leading-relaxed">
          That page has either moved or never existed. The work is all still
          where you left it.
        </p>

        <div className="mt-8 flex flex-wrap gap-6">
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-2 text-sm text-accent"
          >
            <span className="border-b border-accent/40 pb-1 transition-colors group-hover:border-accent">
              See all work
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm text-neutral-500"
          >
            <span className="border-b border-neutral-900/20 pb-1 transition-colors group-hover:border-neutral-900">
              Back home
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

import { Link } from 'react-router-dom'

// Site-wide footer. Rendered once in App so every public page gets it.
function Footer() {
  return (
    <footer className="border-t border-neutral-900/10 px-6 md:px-10 py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl md:text-3xl">Ioana Dobrin</p>
          <p className="mt-1 text-sm text-neutral-500">
            Graphic designer &amp; fine artist
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
          <Link to="/gallery" className="transition-colors hover:text-accent">
            Gallery
          </Link>
          <Link to="/about" className="transition-colors hover:text-accent">
            About
          </Link>
          <Link to="/contact" className="transition-colors hover:text-accent">
            Contact
          </Link>
        </div>
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

export default Footer

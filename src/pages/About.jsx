import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="px-6 md:px-10 pt-10 md:pt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-5 md:mb-6">
          Behind the work
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mb-12 md:mb-16">
          About <em className="italic text-accent">me.</em>
        </h1>

        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {/* The story, kept to a readable measure */}
          <div className="md:col-span-7 flex flex-col gap-5 text-lg text-neutral-600 leading-relaxed">
            <p>
              I'm Ioana, a graphic designer and fine artist based in the UK,
              originally from Romania. I work across visual identity,
              illustration, and digital design.
            </p>
            <p>
              My background combines traditional fine art training with modern
              design tools, which lets me bring a hand-crafted sensibility to
              digital work.
            </p>
          </div>

          {/* Side column: the toolkit, then a way through to the contact page */}
          <div className="md:col-span-5">
            <h2 className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-4">
              Tools I use
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Adobe Photoshop, Illustrator, InDesign, Figma, and traditional
              media including oils and watercolour.
            </p>

            <Link
              to="/contact"
              className="group mt-8 inline-flex items-center gap-2 text-sm text-accent"
            >
              <span className="border-b border-accent/40 pb-1 transition-colors group-hover:border-accent">
                Get in touch
              </span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

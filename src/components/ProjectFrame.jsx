import { Link } from 'react-router-dom'
import { categoryLabel } from '../lib/categories'

// Every image on the site goes through here, so the rule only lives in one
// place: artwork sits on a padded panel and object-contain scales it to fit.
// Nothing is ever cropped, whatever shape it happens to be.
export function FramedImage({ src, alt, height = 'h-[380px]', hover = false }) {
  return (
    <div
      className={`${height} bg-panel flex items-center justify-center overflow-hidden p-6 md:p-10`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-contain${
            hover ? ' transition-transform duration-700 ease-out group-hover:scale-[1.03]' : ''
          }`}
        />
      ) : (
        // No image uploaded yet - keep the frame, skip the broken image icon
        <span className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
          No image yet
        </span>
      )}
    </div>
  )
}

// A framed cover image plus its caption, linking through to the project.
// Used by the home page and the gallery so both stay in step.
function ProjectFrame({ project, height, titleSize = 'text-xl md:text-2xl' }) {
  return (
    <Link to={`/project/${project.id}`} className="group block">
      <FramedImage src={project.cover_image_url} alt={project.title} height={height} hover />

      {/* Caption: title on the left, category on the right */}
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className={`font-display ${titleSize} group-hover:text-accent transition-colors`}>
          {project.title}
        </h3>
        <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500">
          {categoryLabel(project.category)}
        </span>
      </div>
    </Link>
  )
}

export default ProjectFrame

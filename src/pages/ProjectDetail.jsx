import { useState, useEffect } from 'react'
// useParams reads the :id from the URL, Link for the back button
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { categoryLabel } from '../lib/categories'
import { FramedImage } from '../components/ProjectFrame'

function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <p className="px-6 md:px-10 py-16 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
        Loading…
      </p>
    )
  }
  // If the id doesn't match any project, show a friendly message
  if (!project) {
    return (
      <div className="px-6 md:px-10 py-16">
        <p className="font-display text-3xl">Project not found.</p>
        <Link
          to="/gallery"
          className="mt-4 inline-block text-[0.7rem] uppercase tracking-[0.2em] text-accent"
        >
          ← Back to gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1100px]">
        <Link
          to="/gallery"
          className="text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-accent"
        >
          ← Back to gallery
        </Link>

        {/* Title on the left, the details line on the right - same shape as
            the captions under every frame */}
        <div className="mt-6 mb-10 md:mb-14 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-10">
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95] tracking-tight">
            {project.title}
          </h1>
          <p className="shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500">
            {categoryLabel(project.category)}
            {project.year && ` · ${project.year}`}
            {project.client && ` · for ${project.client}`}
          </p>
        </div>

        {/* Cover image always shows first */}
        <FramedImage
          src={project.cover_image_url}
          alt={project.title}
          height="h-[420px] sm:h-[520px] md:h-[640px]"
          eager
        />

        {/* The description, written in the admin form, reads as the opening
            paragraph. Kept to a narrow measure like the text blocks below,
            and pre-line so the line breaks typed into the form survive. */}
        {project.description && (
          <p className="mt-10 md:mt-14 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-neutral-600">
            {project.description}
          </p>
        )}

        {/* Render each block in order. project.blocks is the array from the database.
            The || [] guards against it being null on older projects. */}
        <div className="mt-12 md:mt-16 flex flex-col gap-12 md:gap-16">
          {(project.blocks || []).map((block, index) => {
            // A text block: show heading (if any) and body (if any)
            if (block.type === 'text') {
              return (
                <div key={index} className="max-w-2xl">
                  {block.heading && (
                    <h2 className="font-display text-2xl md:text-4xl mb-4">
                      {block.heading}
                    </h2>
                  )}
                  {block.body && (
                    <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                      {block.body}
                    </p>
                  )}
                </div>
              )
            }

            // An image block: same framed treatment, optional caption below
            if (block.type === 'image') {
              return (
                <figure key={index}>
                  <FramedImage
                    src={block.url}
                    alt={block.caption || project.title}
                    height="h-[360px] sm:h-[480px] md:h-[560px]"
                  />
                  {block.caption && (
                    <figcaption className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )
            }

            // Unknown block type - render nothing
            return null
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail

import { useState, useEffect } from 'react'
// useParams reads the :id from the URL, Link for the back button
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { categoryLabel } from '../lib/categories'

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

  if (loading) return <p className="p-6">Loading...</p>
  // If the id doesn't match any project, show a friendly message
  if (!project) return <p className="p-6">Project not found.</p>

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/gallery"
        className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
      >
        ← Back to gallery
      </Link>

      <h1 className="font-display text-4xl md:text-5xl mt-6 mb-3">
        {project.title}
      </h1>

      <p className="text-xs uppercase tracking-widest text-neutral-400 mb-10">
        {categoryLabel(project.category)}
        {project.year && ` · ${project.year}`}
        {project.client && ` · for ${project.client}`}
      </p>

      <img
        src={project.cover_image_url}
        alt={project.title}
        className="w-full rounded-xl mb-10"
      />

      <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
        {project.description}
      </p>
    </div>
  )
}

export default ProjectDetail
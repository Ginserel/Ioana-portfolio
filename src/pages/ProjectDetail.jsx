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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/gallery" className="text-sm underline text-gray-600">
        ← Back to gallery
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-2">{project.title}</h1>

      {/* Meta line: category, year, client - only show what exists */}
      <p className="text-sm text-gray-500 mb-6">
        {categoryLabel(project.category)}
        {project.year && ` · ${project.year}`}
        {project.client && ` · for ${project.client}`}
      </p>

      <img
        src={project.cover_image_url}
        alt={project.title}
        className="w-full rounded-lg mb-6"
      />

      <p className="text-gray-700 whitespace-pre-line">
        {project.description}
      </p>
    </div>
  )
}

export default ProjectDetail
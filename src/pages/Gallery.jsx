import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { categoryLabel } from '../lib/categories'

function Gallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data)
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <p className="p-6">Loading projects...</p>
  }

  return (
    <div className="px-6 md:px-10 py-16">
      <h1 className="font-display text-4xl mb-10">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link key={project.id} to={`/project/${project.id}`} className="group">
            <div className="overflow-hidden rounded-xl mb-3">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h2 className="font-medium">{project.title}</h2>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
              {categoryLabel(project.category)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Gallery
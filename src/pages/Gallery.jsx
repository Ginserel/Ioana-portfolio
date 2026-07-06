import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gallery</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg overflow-hidden">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-3">
              <h2 className="font-medium">{project.title}</h2>
              <p className="text-sm text-gray-500">{project.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, categoryLabel } from '../lib/categories'

function Gallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  // Which category is currently selected. 'all' means show everything.
  const [activeCategory, setActiveCategory] = useState('all')

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

  // Build the list to display: everything, or only the matching category
  const visibleProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <div className="px-6 md:px-10 py-16">
      <h1 className="font-display text-4xl mb-8">Gallery</h1>

      {/* Filter bar - "All" plus one button per category */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
            activeCategory === 'all'
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
          }`}
        >
          All
        </button>

        {/* Object.entries turns CATEGORY_LABELS into [key, label] pairs
            so we can generate one button per category automatically */}
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
              activeCategory === value
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleProjects.map((project) => (
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
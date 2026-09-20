import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSearchParams } from 'react-router-dom'
import { CATEGORY_LABELS } from '../lib/categories'
import ProjectFrame from '../components/ProjectFrame'

function Gallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  // Which category is currently selected lives in the URL (/gallery?category=fine_art)
  // so the home page can link straight to a filtered view. No param = show everything.
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'

  function setActiveCategory(value) {
    // 'all' clears the param so the URL stays clean
    setSearchParams(value === 'all' ? {} : { category: value })
  }

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

  // Build the list to display: everything, or only the matching category
  const visibleProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  // 'All' plus one entry per category, so the filter bar is one loop
  const filters = [['all', 'All'], ...Object.entries(CATEGORY_LABELS)]

  return (
    <div className="px-6 md:px-10 pt-10 md:pt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-5 md:mb-6">
          The archive
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10 md:mb-14">
          Selected <em className="italic text-accent">work.</em>
        </h1>

        {/* Filter bar - one row of labels, the active one carries the accent */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-y border-neutral-900/10 py-4 mb-10 md:mb-14">
          {filters.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
                activeCategory === value
                  ? 'text-accent'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400">
            Loading work…
          </p>
        ) : visibleProjects.length === 0 ? (
          <p className="font-display text-2xl text-neutral-500">
            Nothing here yet — try another category.
          </p>
        ) : (
          <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectFrame key={project.id} project={project} height="h-[380px]" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Gallery

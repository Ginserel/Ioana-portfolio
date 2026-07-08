import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { categoryLabel } from '../lib/categories'

function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching featured projects:', error)
      } else {
        setFeatured(data)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <div>
      <section className="text-center py-28 md:py-40 px-6">
        <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-6">
          Ioana Dobrin
        </h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-10 leading-relaxed">
          Graphic designer and fine artist creating visual identities,
          illustrations, and digital experiences.
        </p>
        <Link
          to="/gallery"
          className="inline-block border border-neutral-900 px-8 py-3 rounded-full text-sm hover:bg-neutral-900 hover:text-white transition-colors"
        >
          View my work
        </Link>
      </section>

      <section className="px-6 md:px-10 pb-24">
        <h2 className="font-display text-2xl mb-8">Featured work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((project) => (
            <Link key={project.id} to={`/project/${project.id}`} className="group">
              <div className="overflow-hidden rounded-xl mb-3">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
                {categoryLabel(project.category)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
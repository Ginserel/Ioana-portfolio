import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

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
      <section className="text-center py-24 px-6">
        <h1 className="text-4xl font-bold mb-4">Ioana Dobrin</h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Graphic designer and fine artist creating visual identities,
          illustrations, and digital experiences.
        </p>
        <Link
          to="/gallery"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg"
        >
          View my work
        </Link>
      </section>

      <section className="px-6 pb-16">
        <h2 className="text-xl font-medium mb-4">Featured work</h2>
        <div className="grid grid-cols-3 gap-4">
          {featured.map((project) => (
            <div key={project.id} className="border rounded-lg overflow-hidden">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-gray-500">{project.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
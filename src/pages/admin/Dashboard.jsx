import { useState, useEffect } from 'react'
// Link = clickable navigation, useNavigate = redirect from code
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const navigate = useNavigate()

  // Security gate - check who's logged in, runs once on page load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        navigate('/caledeacces1988')
      }
    })
  }, [navigate])

// Fetch both datasets and store them in state
  async function loadData() {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })

    const { data: messageData } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    setProjects(projectData || [])
    setMessages(messageData || [])
  }

  // Fetch once we know we're logged in
  useEffect(() => {
    if (!session) return
    loadData().catch(console.error)
  }, [session])

  // Delete a project after asking for confirmation
  async function handleDelete(project) {
    // window.confirm shows the browser's built-in OK/Cancel popup
    const ok = window.confirm(`Delete "${project.title}"? This cannot be undone.`)
    if (!ok) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      console.error(error)
      alert('Delete failed. Check the console.')
    } else {
      // Refresh the list so the deleted project disappears
      loadData()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (!session) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="text-sm underline">
          Log out
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Projects</p>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Messages</p>
          <p className="text-2xl font-bold">{messages.length}</p>
        </div>
      </div>

      {/* Projects section with Add button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Projects</h2>
        <Link
          to="/admin/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add project
        </Link>
      </div>

      {/* One row per project: thumbnail, title, edit and delete controls */}
      <div className="flex flex-col gap-2 mb-10">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between border rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              {/* Small thumbnail of the cover image */}
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-14 h-10 object-cover rounded"
              />
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-xs text-gray-500">{project.category}</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              {/* Edit links to the form in edit mode, passing this project's id */}
              <Link to={`/admin/edit/${project.id}`} className="underline">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(project)}
                className="text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Messages section */}
      <h2 className="text-lg font-medium mb-3">Recent messages</h2>
      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded-lg p-4">
            <p className="font-medium">
              {msg.name}{' '}
              <span className="text-sm text-gray-500">({msg.email})</span>
            </p>
            <p className="text-gray-700 mt-1">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
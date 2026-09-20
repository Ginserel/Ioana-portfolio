import { useState, useEffect } from 'react'
// Link = clickable navigation, useNavigate = redirect from code
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  // True while a reorder is being saved - stops double clicks racing each other
  const [reordering, setReordering] = useState(false)
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

  // Move a project one step up or down the list.
  // index = where it sits now, direction = -1 for up, +1 for down.
  async function moveProject(index, direction) {
    const targetIndex = index + direction
    // Already first or last - there's nothing to swap with
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const current = projects[index]
    const neighbour = projects[targetIndex]

    // Show the new order immediately, then save it in the background
    const reordered = [...projects]
    reordered[index] = neighbour
    reordered[targetIndex] = current
    setProjects(reordered)
    setReordering(true)

    // Normally the two rows just trade order_index values. If those values are
    // missing or identical (rows that were never ordered all sit at 0) swapping
    // them would change nothing, so renumber the whole list instead.
    const canSwap =
      typeof current.order_index === 'number' &&
      typeof neighbour.order_index === 'number' &&
      current.order_index !== neighbour.order_index

    const updates = canSwap
      ? [
          { id: current.id, order_index: neighbour.order_index },
          { id: neighbour.id, order_index: current.order_index },
        ]
      : reordered.map((project, i) => ({ id: project.id, order_index: i }))

    const results = await Promise.all(
      updates.map((update) =>
        supabase
          .from('projects')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      )
    )

    const failed = results.find((result) => result.error)
    if (failed) {
      console.error(failed.error)
      alert('Could not save the new order. Check the console.')
    }

    // Re-read from the database so the list matches what's actually stored
    await loadData()
    setReordering(false)
  }

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

  // Delete a message after confirmation - same pattern as project delete
  async function handleDeleteMessage(msg) {
    const ok = window.confirm(`Delete message from ${msg.name}?`)
    if (!ok) return

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', msg.id)

    if (error) {
      console.error(error)
      alert('Delete failed. Check the console.')
    } else {
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
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="flex items-center justify-between border rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              {/* Reorder controls - this is the order the site shows projects in */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveProject(index, -1)}
                  disabled={index === 0 || reordering}
                  title="Move up"
                  aria-label={`Move ${project.title} up`}
                  className="border rounded w-6 h-5 leading-none text-xs disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveProject(index, 1)}
                  disabled={index === projects.length - 1 || reordering}
                  title="Move down"
                  aria-label={`Move ${project.title} down`}
                  className="border rounded w-6 h-5 leading-none text-xs disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  ↓
                </button>
              </div>
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
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {msg.name}{' '}
                  <span className="text-sm text-neutral-400">({msg.email})</span>
                </p>
                {/* toLocaleDateString formats the raw timestamp into a readable date */}
                <p className="text-xs text-neutral-400">
                  {new Date(msg.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                {/* mailto: opens the default email app with the address pre-filled */}
                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${msg.email}&su=Re: your message`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Reply
                </a>
                <button
                  onClick={() => handleDeleteMessage(msg)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-neutral-600 mt-2">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
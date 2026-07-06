import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        navigate('/login')
      }
    })
  }, [navigate])

  useEffect(() => {
    if (!session) return

    async function fetchData() {
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

    fetchData()
  }, [session])

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
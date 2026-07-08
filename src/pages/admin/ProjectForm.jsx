// Tools from React: useState = component memory, useEffect = run code on load
import { useState, useEffect } from 'react'
// useNavigate = redirect from code, useParams = read values from the URL (like :id)
import { useNavigate, useParams } from 'react-router-dom'
// Our Supabase connection (the "waiter" that talks to the database)
import { supabase } from '../../lib/supabaseClient'

function ProjectForm() {
  // If the URL is /admin/edit/5, then id = "5". If URL is /admin/new, id = undefined
  const { id } = useParams()
  const navigate = useNavigate()
  // Boolean(id) converts id to true/false: id exists = editing, no id = adding new
  const isEditing = Boolean(id)

  // One piece of state for every form field
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('fine_art') // default selection
  const [year, setYear] = useState('')
  const [client, setClient] = useState('')
  const [featured, setFeatured] = useState(false)
  // The actual image file the user picks (not uploaded yet, just selected)
  const [coverFile, setCoverFile] = useState(null)
  // When editing: the URL of the image that's already saved
  const [existingCoverUrl, setExistingCoverUrl] = useState('')
  // True while saving - used to disable the button and show "Saving..."
  const [saving, setSaving] = useState(false)
  // Feedback message shown to the user (errors, validation)
  const [status, setStatus] = useState('')

  // SECURITY CHECK - runs once when page loads.
  // If nobody is logged in, kick them out to the hidden login page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/caledeacces1988')
    })
  }, [navigate])

  // EDIT MODE ONLY - if we have an id, fetch that project's current data
  // and pre-fill all the form fields with it
  useEffect(() => {
    if (!isEditing) return // adding new? skip all of this

    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)     // only the row matching our id
        .single()          // expect exactly one result, not a list

      if (error || !data) {
        setStatus('Could not load project.')
        return
      }

      // Fill each form field with the existing values
      // The || '' means: if the value is NULL, use empty string instead
      // (React inputs don't like being given null)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setCategory(data.category || 'fine_art')
      setYear(data.year || '')
      setClient(data.client || '')
      setFeatured(data.featured || false)
      setExistingCoverUrl(data.cover_image_url || '')
    }

    fetchProject()
  }, [id, isEditing])

  // THE MAIN SAVE FUNCTION - runs when "Save project" is clicked
  async function handleSave() {
    // Basic validation: title is the only truly required field
    if (!title) {
      setStatus('Title is required.')
      return
    }

    setSaving(true)  // disables the button
    setStatus('')    // clear any old error message

    // Start with the existing image URL (relevant when editing)
    let coverUrl = existingCoverUrl

    // ONLY if the user picked a new file, upload it
    if (coverFile) {
      // Date.now() = current timestamp in milliseconds.
      // Prepending it makes the filename unique, so two files
      // called "painting.jpg" can never overwrite each other
      const fileName = `${Date.now()}-${coverFile.name}`

      // Upload the file to our storage bucket
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, coverFile)

      if (uploadError) {
        console.error(uploadError)
        setStatus('Image upload failed.')
        setSaving(false)
        return // stop here - don't save a project with a broken image
      }

      // Ask Supabase for the permanent public URL of what we just uploaded
      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName)

      // This URL is what gets stored in the database
      coverUrl = urlData.publicUrl
    }

    // Build the object we'll send to the database.
    // Keys here match the column names in the projects table
    const projectData = {
      title,
      description,
      category,
      year: year ? Number(year) : null,   // convert text input to number, or NULL if empty
      client: client || null,             // empty string becomes NULL
      featured,
      cover_image_url: coverUrl,
    }

    let error

    if (isEditing) {
      // UPDATE the existing row that matches our id
      ;({ error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id))
    } else {
      // INSERT a brand new row
      ;({ error } = await supabase.from('projects').insert(projectData))
    }

    setSaving(false)

    if (error) {
      console.error(error)
      setStatus('Save failed. Check the console.')
    } else {
      // Success - go back to the dashboard
      navigate('/admin')
    }
  }

  // THE VISUAL PART (JSX)
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* Heading changes depending on mode */}
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit project' : 'Add project'}
      </h1>

      <div className="flex flex-col gap-4">
        {/* Each input is "controlled": its value comes from state,
            and typing updates that state via onChange */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <textarea
          placeholder="Description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        {/* Dropdown - values match exactly what we store in the category column */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="fine_art">Fine art</option>
          <option value="graphic_design">Graphic design</option>
          <option value="ux_ui">UX / UI</option>
        </select>
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <input
          type="text"
          placeholder="Client (optional)"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        {/* Checkbox for the featured flag - note it uses "checked" not "value" */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured on homepage
        </label>

        {/* Image section */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Cover image</p>
          {/* When editing: show the current image as a preview,
              but only if no new file has been chosen yet */}
          {existingCoverUrl && !coverFile && (
            <img
              src={existingCoverUrl}
              alt="Current cover"
              className="w-40 h-28 object-cover rounded-lg mb-2"
            />
          )}
          {/* File picker - accept="image/*" limits it to image files.
              e.target.files[0] = the first (only) file the user selected */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
          />
        </div>

        {/* disabled={saving} stops double-clicks while a save is in progress */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save project'}
        </button>
        {/* Only render the status paragraph if there's a message to show */}
        {status && <p className="text-sm text-red-600">{status}</p>}
      </div>
    </div>
  )
}

export default ProjectForm
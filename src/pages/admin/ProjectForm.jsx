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
  
  // The array of content blocks. Each item is an object like
  // { type: 'text', heading: '', body: '' }
  const [blocks, setBlocks] = useState([])

  // One piece of state for every form field
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('fashion_licensing') // default selection
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
  // Which block index is currently uploading an image (null = none)
  const [uploadingIndex, setUploadingIndex] = useState(null)

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
      setBlocks(data.blocks || [])
    }

    fetchProject()
  }, [id, isEditing])

  // Add a new empty text block to the end of the array
  function addTextBlock() {
    // We create a BRAND NEW array: spread the old blocks, add the new one.
    // Never modify the existing array directly - React needs a new array
    // to notice the change and re-render.
    setBlocks([...blocks, { type: 'text', heading: '', body: '' }])
  }

  // Add a new empty image block to the end
  function addImageBlock() {
    setBlocks([...blocks, { type: 'image', url: '', caption: '' }])
  }

  // Upload a file for one specific block, then store its URL in that block
  async function handleBlockImageUpload(index, file) {
    if (!file) return

    setUploadingIndex(index) // show "Uploading..." on this block

    // Same unique-filename trick as the cover image
    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error(uploadError)
      setStatus('Image upload failed.')
      setUploadingIndex(null)
      return
    }

    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName)

    // Store the resulting URL inside this block
    updateBlock(index, 'url', urlData.publicUrl)
    setUploadingIndex(null)
  }

  // Update one field of one block, identified by its position (index)
  function updateBlock(index, field, value) {
    // Using the "prev =>" form guarantees we work from the LATEST blocks,
    // which matters when this runs after an await (image upload)
    setBlocks((prev) =>
      prev.map((block, i) =>
        i === index ? { ...block, [field]: value } : block
      )
    )
  }

  // Remove the block at a given position
  function removeBlock(index) {
    // .filter keeps every block EXCEPT the one at our index
    setBlocks(blocks.filter((_, i) => i !== index))
  }
  // Move a block one position earlier in the array (towards the top)
  function moveBlockUp(index) {
    if (index === 0) return // already at the top, nothing to do
    const updated = [...blocks] // copy the array
    // Swap this block with the one above it
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setBlocks(updated)
  }
  

  // Move a block one position later (towards the bottom)
  function moveBlockDown(index) {
    if (index === blocks.length - 1) return // already at the bottom
    const updated = [...blocks]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setBlocks(updated)
  }

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
          blocks,
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
          <option value="fashion_licensing">Fashion licensing</option>
          <option value="graphic_design">Graphic design</option>
          <option value="illustration">Illustration</option>
          <option value="fine_art">Fine art</option>
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

        {/* Content blocks editor */}
        <div className="border-t pt-4 mt-2">
          <p className="text-sm font-medium mb-3">Content blocks</p>

          {/* Render an editable card for each block in state */}
          {blocks.map((block, index) => (
            <div key={index} className="border rounded-lg p-3 mb-3 bg-neutral-50">
              {block.type === 'text' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Heading (optional)"
                    value={block.heading}
                    onChange={(e) => updateBlock(index, 'heading', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Body text (optional)"
                    rows="3"
                    value={block.body}
                    onChange={(e) => updateBlock(index, 'body', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="flex flex-col gap-2">
                  {/* Preview once uploaded */}
                  {block.url && (
                    <img
                      src={block.url}
                      alt={block.caption || 'Block image'}
                      className="w-40 h-28 object-cover rounded-lg"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleBlockImageUpload(index, e.target.files[0])
                    }
                    className="text-sm"
                  />
                  {/* Feedback while the file is going up */}
                  {uploadingIndex === index && (
                    <p className="text-xs text-neutral-500">Uploading...</p>
                  )}
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={block.caption}
                    onChange={(e) => updateBlock(index, 'caption', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              {/* Reorder and remove controls */}
              <div className="flex gap-3 mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => moveBlockUp(index)}
                  disabled={index === 0}
                  className="underline disabled:opacity-30"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => moveBlockDown(index)}
                  disabled={index === blocks.length - 1}
                  className="underline disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="text-red-600 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* Buttons to add blocks */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addTextBlock}
              className="text-sm border rounded-lg px-3 py-2"
            >
              + Add text block
            </button>
            <button
              type="button"
              onClick={addImageBlock}
              className="text-sm border rounded-lg px-3 py-2"
            >
              + Add image block
            </button>
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
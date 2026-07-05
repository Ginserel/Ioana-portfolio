import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <span className="font-medium">Ioana Dobrin</span>
      <div className="flex gap-6 text-sm">
        <Link to="/">Home</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  )
}

export default Navbar
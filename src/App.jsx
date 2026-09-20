import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProjectForm from './pages/admin/ProjectForm'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'


function App() {
  // The admin screens are tools, not part of the public site - no footer there
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin') || pathname === '/caledeacces1988'

  return (
    // min-h-screen + flex-1 keeps the footer at the bottom on short pages
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/caledeacces1988" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/new" element={<ProjectForm />} />
          <Route path="/admin/edit/:id" element={<ProjectForm />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          {/* Catch-all - anything else gets the 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProjectForm from './pages/admin/ProjectForm'
import ProjectDetail from './pages/ProjectDetail'


function App() {
  return (
    <>
      <Navbar />
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
      </Routes>
    </>
  )
}

export default App
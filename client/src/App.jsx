import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AnalyzePage from './pages/AnalyzePage'
import ReportPage from './pages/ReportPage'
import ReportsPage from './pages/ReportsPage'
import BuilderPage from './pages/BuilderPage'
import './index.css'

function AppShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: 220,
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/analyze"  element={<AnalyzePage />} />
          <Route path="/reports"  element={<ReportsPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/builder"  element={<BuilderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

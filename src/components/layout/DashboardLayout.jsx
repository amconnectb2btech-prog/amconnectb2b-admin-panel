import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Layers,
  Quote,
  BookOpen,
  FileText,
  Users,
  Settings as SettingsIcon,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLE_LABELS } from '../../firebase/services.js'
import logoIcon from '../../assets/logo_icon.png'
import logoText from '../../assets/logo_text.png' 


const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/submissions', label: 'Contact submissions', icon: Inbox, perm: 'view_submissions' },
  { to: '/services', label: 'Custom services', icon: Layers, perm: 'manage_content' },
  { to: '/testimonials', label: 'Testimonials', icon: Quote, perm: 'manage_content' },
  { to: '/case-studies', label: 'Case studies', icon: BookOpen, perm: 'manage_content' },
  { to: '/content', label: 'Site content', icon: FileText, perm: 'manage_settings' },
  { to: '/users', label: 'Admin users', icon: Users, perm: 'manage_users' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, perm: 'manage_settings' },
]

export default function DashboardLayout() {
  const { profile, signOut, can } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const visibleNav = nav.filter((n) => !n.perm || can(n.perm))

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 flex-none border-r border-line bg-white lg:flex lg:flex-col">
        <SidebarContent nav={visibleNav} />
      </aside>

      {/* Sidebar — mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-lifted">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-2 text-ink-500 hover:bg-canvas"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent nav={visibleNav} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-ink-500 hover:bg-canvas lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="https://amconnectb2b.com"
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm text-ink-500 hover:text-ink-900 sm:inline"
            >
              View site →
            </a>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-sm hover:bg-canvas"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-100 text-accent-700">
                  {(profile?.name || profile?.email || '?').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-ink-900">{profile?.name || profile?.email}</span>
                  <span className="block text-xs text-ink-500">{ROLE_LABELS[profile?.role]}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-ink-400" />
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-line bg-white shadow-lifted"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-canvas"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Outlet */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ nav, onNavigate }) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-line px-6">
      <Link
          to="/dashboard"
          className="flex items-center gap-1"
          onClick={onNavigate}
        >
          {/* Logo Icon */}
          <div className="flex items-center justify-center h-10 overflow-hidden rounded">
            <img
              src={logoIcon}
              alt="AMConnect Icon"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>

          {/* Logo Text */}
          <div className="h-8 flex items-center mt-1">
            <img
              src={logoText}
              alt="AMConnect B2B"
              className="h-full w-auto object-contain"
              loading="eager"
            />
          </div>
        </Link>

      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs uppercase tracking-wider text-ink-400">Admin panel</p>
        <ul className="space-y-1">
          {nav.map((n) => {
            const Icon = n.icon
            return (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-ink-950 text-white'
                        : 'text-ink-700 hover:bg-canvas hover:text-ink-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t border-line p-4 text-xs text-ink-400">
        <p>AMCONNECTB2B Admin</p>
        <p className="mt-1">v1.0</p>
      </div>
    </>
  )
}

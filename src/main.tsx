import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Shield, Settings } from 'lucide-react'
import { EventsPage } from './features/events/components/EventsPage'
import { LoginForm } from './features/auth/components/LoginForm'
import { AcceptInvitationForm } from './features/auth/components/AcceptInvitationForm'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/components/DashboardPage'
import { EmptyState } from './components/ui/EmptyState'
import { UsersPage } from './features/admin/components/UsersPage'
import { PermissionsMatrixPage } from './features/admin/components/PermissionsMatrixPage'
import { StatisticsPage } from './features/admin/components/StatisticsPage'
import { AttendanceRouter } from './features/attendance/components/AttendanceRouter'
import { PermissionRouter } from './features/permissions/components/PermissionRouter'
import { ReportRouter } from './features/reports/components/ReportRouter'
import { MyInternsPage } from './features/mentor/components/MyInternsPage'
import { InternDetailPage } from './features/mentor/components/InternDetailPage'
import { ProjectsRouter } from './features/projects/components/ProjectsRouter'
import { ProjectDetailPage } from './features/projects/components/ProjectDetailPage'
import { DocumentsRouter } from './features/documents/components/DocumentsRouter'
import { ProfilePage } from './features/settings/components/ProfilePage'
import { UserDetailPage } from './features/admin/components/UserDetailPage'
import { SecretAdminSetupPage } from './features/auth/components/SecretAdminSetupPage'
import { MyProfilePage } from './features/mentor/components/MyProfilePage'
import { MessagingPage } from './features/messaging/components/MessagingPage'
import { PlatformThemeEffect } from './lib/theme/PlatformThemeEffect'
import { applyCachedBrandColors } from './lib/theme/brand-cache'

applyCachedBrandColors()
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PlatformThemeEffect />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/invitation" element={<AcceptInvitationForm />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/admin/utilisateurs" element={<UsersPage />} />
              <Route path="/admin/permissions" element={<PermissionsMatrixPage />} />
              <Route path="/attendance" element={<AttendanceRouter />} />
              <Route path="/permissions" element={<PermissionRouter />} />
              <Route path="/reports" element={<ReportRouter />} />
              <Route path="/mes-stagiaires" element={<MyInternsPage />} />
              <Route path="/mes-stagiaires/:id" element={<InternDetailPage />} />
              <Route path="/projects" element={<ProjectsRouter />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/documents" element={<DocumentsRouter />} />
              <Route path="/admin/stats" element={<StatisticsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/mon-profil" element={<MyProfilePage />} />
              <Route path="/admin/utilisateurs/:id" element={<UserDetailPage />} />
              <Route path="/nimda/creer-nimda" element={<SecretAdminSetupPage />} />
              <Route path="/messagerie" element={<MessagingPage />} />

            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

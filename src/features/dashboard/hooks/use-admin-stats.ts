import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

interface OverviewStats {
  active_interns: number
  completed_internships: number
  pending_reports: number
  pending_documents: number
  average_attendance_rate: number
}

interface AttendanceStats {
  total: number
  present_rate: number
  absent_rate: number
  late_rate: number
}

interface ReportStats {
  total: number
  pending: number
  validated: number
  rejected: number
}

interface DocumentStats {
  total: number
  pending: number
  mentor_approved: number
  mentor_rejected: number
  admin_rejected: number
  completed: number
}

interface StatsResponse<T> {
  success: boolean
  data: T
}

async function fetchOverview(): Promise<StatsResponse<OverviewStats>> {
  const response = await apiClient.get<StatsResponse<OverviewStats>>('/admin/stats/overview')
  return response.data
}

async function fetchAttendanceStats(): Promise<StatsResponse<AttendanceStats>> {
  const response = await apiClient.get<StatsResponse<AttendanceStats>>('/admin/stats/attendance')
  return response.data
}

async function fetchReportStats(): Promise<StatsResponse<ReportStats>> {
  const response = await apiClient.get<StatsResponse<ReportStats>>('/admin/stats/reports')
  return response.data
}

async function fetchDocumentStats(): Promise<StatsResponse<DocumentStats>> {
  const response = await apiClient.get<StatsResponse<DocumentStats>>('/admin/stats/documents')
  return response.data
}

export function useAdminOverview() {
  return useQuery({ queryKey: ['admin', 'stats', 'overview'], queryFn: fetchOverview })
}

export function useAdminAttendanceStats() {
  return useQuery({ queryKey: ['admin', 'stats', 'attendance'], queryFn: fetchAttendanceStats })
}

export function useAdminReportStats() {
  return useQuery({ queryKey: ['admin', 'stats', 'reports'], queryFn: fetchReportStats })
}

export function useAdminDocumentStats() {
  return useQuery({ queryKey: ['admin', 'stats', 'documents'], queryFn: fetchDocumentStats })
}
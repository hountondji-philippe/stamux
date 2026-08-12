export type DocumentType = 'attestation' | 'convention'
export type DocumentStatus = 'pending' | 'mentor_approved' | 'mentor_rejected' | 'admin_rejected' | 'completed'

export interface StamuxDocument {
  id: string
  intern?: { id: string; name: string; email: string }
  type: DocumentType
  status: DocumentStatus
  request_note: string | null
  rejection_reason: string | null
  document_number: string | null
  requested_at: string | null
  reviewed_by?: { id: string; name: string }
  reviewed_at: string | null
  generated_at: string | null
  is_downloadable: boolean
}
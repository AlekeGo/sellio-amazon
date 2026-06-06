import api from './api'
import type { AuditListItem, AuditDetail, CreateAuditPayload } from '../types/audit'

export function listAudits() {
  return api.get<AuditListItem[]>('/audits/')
}

export function createAudit(data: CreateAuditPayload) {
  return api.post<AuditDetail>('/audits/', data)
}

export function getAudit(id: number) {
  return api.get<AuditDetail>(`/audits/${id}/`)
}

export function updateAudit(id: number, data: Partial<CreateAuditPayload>) {
  return api.patch<AuditDetail>(`/audits/${id}/`, data)
}

export function submitAudit(id: number) {
  return api.post<AuditDetail>(`/audits/${id}/submit/`)
}

export function uploadAuditImages(id: number, files: File[]) {
  const form = new FormData()
  files.forEach(f => form.append('images', f))
  return api.post(`/audits/${id}/images/`, form)
}

export function deleteAuditImage(id: number, imageId: number) {
  return api.delete(`/audits/${id}/images/${imageId}/`)
}

import api from './api'
import type { ImageGeneration, CreateImageGenerationPayload } from '../types/imageGeneration'

export function listImageGenerations(auditId?: number) {
  return api.get<ImageGeneration[]>('/images/generations/', {
    params: auditId != null ? { audit_id: auditId } : {},
  })
}

export function createImageGeneration(data: CreateImageGenerationPayload) {
  return api.post<ImageGeneration>('/images/generations/', data)
}

export function getImageGeneration(id: number) {
  return api.get<ImageGeneration>(`/images/generations/${id}/`)
}

export function retryImageGeneration(id: number) {
  return api.post<ImageGeneration>(`/images/generations/${id}/retry/`)
}

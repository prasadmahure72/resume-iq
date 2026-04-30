'use client'

import { create } from 'zustand'

interface UploadedFile {
  file: File
  text: string
  storagePath: string
  filename: string
  pageCount: number
}

interface AnalysisStore {
  uploadedFile: UploadedFile | null
  jobTitle: string
  companyName: string
  jobDescription: string
  isUploading: boolean
  isAnalyzing: boolean
  streamingProgress: number

  setUploadedFile: (file: UploadedFile | null) => void
  setJobTitle: (title: string) => void
  setCompanyName: (name: string) => void
  setJobDescription: (desc: string) => void
  setIsUploading: (loading: boolean) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setStreamingProgress: (progress: number) => void
  reset: () => void
}

const initialState = {
  uploadedFile: null,
  jobTitle: '',
  companyName: '',
  jobDescription: '',
  isUploading: false,
  isAnalyzing: false,
  streamingProgress: 0,
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setJobTitle: (title) => set({ jobTitle: title }),
  setCompanyName: (name) => set({ companyName: name }),
  setJobDescription: (desc) => set({ jobDescription: desc }),
  setIsUploading: (loading) => set({ isUploading: loading }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setStreamingProgress: (progress) => set({ streamingProgress: progress }),
  reset: () => set(initialState),
}))

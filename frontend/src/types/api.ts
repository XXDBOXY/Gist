export interface Folder {
  id: number
  name: string
  parentId?: number
  createdAt: string
  updatedAt: string
}

export interface Feed {
  id: number
  folderId?: number
  title: string
  url: string
  siteUrl?: string
  description?: string
  iconPath?: string
  etag?: string
  lastModified?: string
  createdAt: string
  updatedAt: string
}

export interface FeedPreview {
  url: string
  title: string
  description?: string
  siteUrl?: string
  imageUrl?: string
  itemCount?: number
  lastUpdated?: string
}

export interface Entry {
  id: number
  feedId: number
  title?: string
  url?: string
  content?: string
  readableContent?: string
  thumbnailUrl?: string
  author?: string
  publishedAt?: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface EntryListResponse {
  entries: Entry[]
  hasMore: boolean
}

export interface EntryListParams {
  feedId?: number
  folderId?: number
  unreadOnly?: boolean
  limit?: number
  offset?: number
}

export interface UnreadCountsResponse {
  counts: Record<string, number>
}

export interface MarkAllReadParams {
  feedId?: number
  folderId?: number
}

export interface ApiErrorResponse {
  error: string
}

export interface ImportResult {
  foldersCreated: number
  foldersSkipped: number
  feedsCreated: number
  feedsSkipped: number
}

export interface ImportTask {
  id?: string
  status: 'idle' | 'running' | 'done' | 'error' | 'cancelled'
  total: number
  current: number
  feed?: string
  result?: ImportResult
  error?: string
  createdAt?: string
}

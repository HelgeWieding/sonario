export const CATEGORIES = [
  'feature',
  'improvement',
  'bug',
  'integration',
  'ux',
  'performance',
  'documentation',
  'other',
] as const

export type Category = typeof CATEGORIES[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  feature: 'New Feature',
  improvement: 'Improvement',
  bug: 'Bug Report',
  integration: 'Integration',
  ux: 'UX/Design',
  performance: 'Performance',
  documentation: 'Documentation',
  other: 'Other',
}

export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const

export type Sentiment = typeof SENTIMENTS[number]

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

export const STATUSES = [
  'untriaged',
  'reviewing',
  'planned',
  'in_progress',
  'completed',
  'rejected',
] as const

export type Status = typeof STATUSES[number]

export const STATUS_LABELS: Record<Status, string> = {
  untriaged: 'Untriaged',
  reviewing: 'Reviewing',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
}

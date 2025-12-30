import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedFeatureRequest, FeatureRequest } from '~~/shared/types'
import type { Category, Sentiment, Status } from '~~/shared/constants'

export interface DraftResponseContext {
  customerName: string | null
  featureTitle: string
  featureStatus: Status
  productName: string
}

export class ClaudeService {
  private client: Anthropic

  constructor() {
    const config = useRuntimeConfig()
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    })
  }

  /**
   * Determine if an email contains a feature request
   * Placeholder prompt - refine based on actual email patterns
   */
  async isFeatureRequest(emailContent: string): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Analyze this email and determine if it contains a feature request, product improvement suggestion, enhancement request, or actionable user feedback.

Reply with ONLY "yes" or "no".

Email:
${emailContent}`,
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return text.toLowerCase().trim() === 'yes'
    } catch (error) {
      console.error('Error checking if email is feature request:', error)
      return false
    }
  }

  /**
   * Extract structured feature request data from email content
   * Placeholder prompt - refine based on actual data patterns
   */
  async extractFeatureRequest(emailContent: string): Promise<ExtractedFeatureRequest | null> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Extract the feature request from this email and return it as JSON.

Return ONLY valid JSON in this exact format:
{
  "title": "Brief, descriptive title (max 100 chars)",
  "description": "Detailed description of what the user wants",
  "category": "one of: feature, improvement, bug, integration, ux, performance, documentation, other",
  "sentiment": "one of: positive, neutral, negative (the sentiment of the feedback)"
}

Email:
${emailContent}`,
          },
        ],
      })

      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        return null
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title: parsed.title || 'Untitled Feature Request',
        description: parsed.description || emailContent.substring(0, 500),
        category: this.validateCategory(parsed.category),
        sentiment: this.validateSentiment(parsed.sentiment),
      }
    } catch (error) {
      console.error('Error extracting feature request:', error)
      return null
    }
  }

  /**
   * Find a matching existing feature request
   * Placeholder prompt - refine based on matching accuracy needs
   */
  async findMatchingRequest(
    newRequest: ExtractedFeatureRequest,
    existingRequests: FeatureRequest[]
  ): Promise<FeatureRequest | null> {
    if (existingRequests.length === 0) {
      return null
    }

    try {
      // Create a simplified list of existing requests for the prompt
      const existingList = existingRequests.map((r, i) => ({
        index: i,
        title: r.title,
        description: r.description.substring(0, 200),
      }))

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `You are matching feature requests. Determine if the new request is essentially the same as any existing request.

New request:
Title: ${newRequest.title}
Description: ${newRequest.description}

Existing requests:
${JSON.stringify(existingList, null, 2)}

If the new request matches an existing one (same core feature, just worded differently), respond with ONLY the index number (0-based).
If there is no match, respond with ONLY "none".

Your response:`,
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const trimmed = text.toLowerCase().trim()

      if (trimmed === 'none') {
        return null
      }

      const index = parseInt(trimmed, 10)
      if (!isNaN(index) && index >= 0 && index < existingRequests.length) {
        return existingRequests[index]
      }

      return null
    } catch (error) {
      console.error('Error finding matching request:', error)
      return null
    }
  }

  /**
   * Generate a draft response to inform customer about existing feature request status
   */
  async generateFeatureStatusDraft(context: DraftResponseContext): Promise<string | null> {
    try {
      const statusDescriptions: Record<Status, string> = {
        new: 'has been logged and is awaiting review',
        reviewing: 'is currently being reviewed by our team',
        planned: 'has been approved and is on our roadmap',
        in_progress: 'is actively being worked on',
        completed: 'has been completed',
        rejected: 'has been reviewed but we are unable to implement it at this time',
      }

      const statusText = statusDescriptions[context.featureStatus] || 'is being tracked'

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `You are a friendly customer support representative for ${context.productName}.
A customer has written in about a feature that we already have on file as a feature request.

Write a brief, helpful response that:
1. Thanks them for their feedback
2. Lets them know this feature request already exists and ${statusText}
3. Keeps a warm, professional tone
4. Is concise (2-3 short paragraphs max)
5. Do NOT mention any internal metrics, numbers, or statistics

Feature Request Title: ${context.featureTitle}
Current Status: ${context.featureStatus}
${context.customerName ? `Customer name: ${context.customerName}` : ''}

Write ONLY the response body text, no subject line or signature. Start with a greeting.`,
          },
        ],
      })

      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
      return text.trim() || null
    } catch (error) {
      console.error('Error generating feature status draft:', error)
      return null
    }
  }

  private validateCategory(category: string): Category {
    const validCategories: Category[] = [
      'feature',
      'improvement',
      'bug',
      'integration',
      'ux',
      'performance',
      'documentation',
      'other',
    ]
    return validCategories.includes(category as Category) ? (category as Category) : 'feature'
  }

  private validateSentiment(sentiment: string): Sentiment {
    const validSentiments: Sentiment[] = ['positive', 'neutral', 'negative']
    return validSentiments.includes(sentiment as Sentiment) ? (sentiment as Sentiment) : 'neutral'
  }
}

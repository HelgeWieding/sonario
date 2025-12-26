import { GmailService } from '../../services/gmail.service'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const authUrl = GmailService.getAuthUrl()
  return { data: { authUrl } }
})

import { HelpScoutService } from '../../services/helpscout.service'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const authUrl = HelpScoutService.getAuthUrl()

  return { data: { authUrl } }
})

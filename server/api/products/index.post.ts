import { z } from 'zod'
import { getDb, schema } from '../../db'
import { getOrCreateUser } from '../../utils/auth'
import { badRequest, handleDbError } from '../../utils/errors'

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  emailFilter: z.string().max(200).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event)
  const db = getDb()

  const body = await readBody(event)
  const result = createProductSchema.safeParse(body)

  if (!result.success) {
    badRequest(result.error.errors[0]?.message || 'Invalid input')
  }

  try {
    const [product] = await db.insert(schema.products).values({
      userId: user.id,
      name: result.data!.name,
      description: result.data!.description || null,
      emailFilter: result.data!.emailFilter || null,
    }).returning()

    return { data: product }
  } catch (error) {
    handleDbError(error)
  }
})

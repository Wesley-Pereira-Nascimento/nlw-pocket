import { db } from '../db'
import { goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  diseredWeeklyFrenquency: number
}

export async function createGoal({
  title,
  diseredWeeklyFrenquency,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({ title, diseredWeeklyFrenquency })
    .returning()

  const goal = result[0]

  return { goal }
}

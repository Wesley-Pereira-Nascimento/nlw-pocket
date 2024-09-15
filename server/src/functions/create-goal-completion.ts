import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface CreateGoalCompetionRequest {
  goalId: string
}

export async function createGoalCompetion({
  goalId,
}: CreateGoalCompetionRequest) {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        competionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalsCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.diseredWeeklyFrenquency,
      completionCount: sql /*sql */`
            COALESCE(${goalsCompletionCounts.competionCount}, 0)
        `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalsCompletionCounts, eq(goalsCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

    const {completionCount, desiredWeeklyFrequency } = result[0]   
    if(completionCount >= desiredWeeklyFrequency) {
      throw new Error('Goal already completed this week')
    } 

     

   const insetResult = await db.insert(goalCompletions).values({ goalId }).returning()

  const goalCompletion = insetResult[0]

  return {goalCompletion}
}

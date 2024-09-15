import { count, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { goal, goalCompletion } from '../db/schema'
import { GoalAlreadyCompletedError } from '../http/errors/goal-already-completed-error'

interface CompleteGoalRequest {
    goalId: string
}

export async function completeGoal({ goalId }: CompleteGoalRequest) {
    const goalCompletionCountOnTheWeek = db
        .$with('goal_completion_count_on_the_week')
        .as(
            db
                .select({
                    goalId: goalCompletion.goalId,
                    completionsCount: count(goalCompletion.id).as(
                        'completionsCount'
                    ),
                })
                .from(goalCompletion)
                .where(eq(goalCompletion.goalId, goalId))
                .groupBy(goalCompletion.goalId)
        )

    const result = await db
        .with(goalCompletionCountOnTheWeek)
        .select({
            weeklyFrequency: goal.weeklyFrequency,
            completionsCount: sql`
                COALESCE(${goalCompletionCountOnTheWeek.completionsCount}, 0)
            `.mapWith(Number),
        })
        .from(goal)
        .leftJoin(
            goalCompletionCountOnTheWeek,
            eq(goal.id, goalCompletionCountOnTheWeek.goalId)
        )
        .where(eq(goal.id, goalId))

    const { completionsCount, weeklyFrequency } = result[0]

    if (completionsCount >= weeklyFrequency) {
        throw new GoalAlreadyCompletedError()
    }

    await db.insert(goalCompletion).values({ goalId })
}

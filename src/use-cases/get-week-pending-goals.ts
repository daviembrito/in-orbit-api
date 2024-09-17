import dayjs from 'dayjs'
import { db } from '../db'
import { goal, goalCompletion } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekPendingGoals() {
    const firstDayOfTheWeek = dayjs().startOf('week').toDate()
    const lastDayOfTheWeek = dayjs().endOf('week').toDate()

    const goalsOnTheWeek = db.$with('goals_on_the_week').as(
        db
            .select({
                id: goal.id,
                title: goal.title,
                weeklyFrequency: goal.weeklyFrequency,
                createdAt: goal.createdAt,
            })
            .from(goal)
            .where(
                and(
                    gte(goal.createdAt, firstDayOfTheWeek),
                    lte(goal.createdAt, lastDayOfTheWeek)
                )
            )
    )

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
                .where(
                    and(
                        gte(goalCompletion.completedAt, firstDayOfTheWeek),
                        lte(goalCompletion.completedAt, lastDayOfTheWeek)
                    )
                )
                .groupBy(goalCompletion.goalId)
        )

    const pendingGoals = await db
        .with(goalsOnTheWeek, goalCompletionCountOnTheWeek)
        .select({
            id: goalsOnTheWeek.id,
            title: goalsOnTheWeek.title,
            weeklyFrenquency: goalsOnTheWeek.weeklyFrequency,
            completionCount: sql`
                COALESCE(${goalCompletionCountOnTheWeek.completionsCount}, 0)
            `.mapWith(Number),
        })
        .from(goalsOnTheWeek)
        .leftJoin(
            goalCompletionCountOnTheWeek,
            eq(goalCompletionCountOnTheWeek.goalId, goalsOnTheWeek.id)
        )

    return { pendingGoals }
}

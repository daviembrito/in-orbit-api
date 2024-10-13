import dayjs from 'dayjs'
import { db } from '../db'
import { goal, goalCompletion } from '../db/schema'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekSummary() {
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

    const completionsOnTheWeek = db.$with('completions_on_the_week').as(
        db
            .select({
                id: goalCompletion.id,
                title: goal.title,
                completedAt: goalCompletion.completedAt,
                completedAtDate: sql`
                        DATE(${goalCompletion.completedAt})
                    `.as('completedAtDate'),
            })
            .from(goalCompletion)
            .innerJoin(goal, eq(goal.id, goalCompletion.goalId))
            .where(
                and(
                    gte(goalCompletion.completedAt, firstDayOfTheWeek),
                    lte(goalCompletion.completedAt, lastDayOfTheWeek)
                )
            )
            .orderBy(desc(goalCompletion.completedAt))
    )

    const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
        db
            .select({
                completedAtDate: completionsOnTheWeek.completedAtDate,
                completions: sql`
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', ${completionsOnTheWeek.id},
                                'title', ${completionsOnTheWeek.title},
                                'completedAt', ${completionsOnTheWeek.completedAt}
                            )
                        )
                    `.as('completions'),
            })
            .from(completionsOnTheWeek)
            .groupBy(completionsOnTheWeek.completedAtDate)
            .orderBy(desc(completionsOnTheWeek.completedAtDate))
    )

    type CompletionPerDay = Record<
        string,
        {
            id: string
            title: string
            completedAt: string
        }[]
    >

    const result = await db
        .with(goalsOnTheWeek, completionsOnTheWeek, goalsCompletedByWeekDay)
        .select({
            completed:
                sql`(SELECT COUNT(*) FROM ${completionsOnTheWeek})`.mapWith(
                    Number
                ),
            total: sql`(SELECT SUM(${goalsOnTheWeek.weeklyFrequency}) FROM ${goalsOnTheWeek})`.mapWith(
                Number
            ),
            completionsPerDay: sql<CompletionPerDay>`
                JSON_OBJECT_AGG(
                    ${goalsCompletedByWeekDay.completedAtDate},
                    ${goalsCompletedByWeekDay.completions}
                )
            `,
        })
        .from(goalsCompletedByWeekDay)

    return result[0]
}

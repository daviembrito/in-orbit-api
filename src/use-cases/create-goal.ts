import { db } from '../db'
import { goal } from '../db/schema'

type CreateGoalRequest = {
    title: string
    weeklyFrequency: number
}

export async function createGoal({
    title,
    weeklyFrequency,
}: CreateGoalRequest) {
    const result = await db
        .insert(goal)
        .values({
            title,
            weeklyFrequency,
        })
        .returning()

    const createdGoal = result[0]

    return {
        createGoal,
    }
}

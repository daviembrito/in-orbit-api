import dayjs from 'dayjs'
import { client, db } from '.'
import { goal, goalCompletion } from './schema'

async function seed() {
    await db.delete(goalCompletion)
    await db.delete(goal)

    const goals = await db
        .insert(goal)
        .values([
            {
                title: 'Caminhar cedo',
                weeklyFrequency: 5,
            },
            {
                title: 'Estudar programação',
                weeklyFrequency: 4,
            },
            {
                title: 'Ler',
                weeklyFrequency: 3,
            },
        ])
        .returning()

    const startOfWeek = dayjs().startOf('week')

    await db.insert(goalCompletion).values([
        {
            goalId: goals[0].id,
            completedAt: startOfWeek.toDate(),
        },
        {
            goalId: goals[1].id,
            completedAt: startOfWeek.add(1, 'day').toDate(),
        },
    ])
}

seed().finally(() => client.end())

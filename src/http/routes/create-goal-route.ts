import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createGoal } from '../../use-cases/create-goal'

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
    app.post(
        '/goals',
        {
            schema: {
                body: z.object({
                    title: z.string(),
                    weeklyFrequency: z.number().int().min(1).max(7),
                }),
            },
        },
        async (request, reply) => {
            const { title, weeklyFrequency } = request.body

            await createGoal({ title, weeklyFrequency })

            return reply.status(201).send()
        }
    )
}

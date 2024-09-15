import { GoalAlreadyCompletedError } from './../errors/goal-already-completed-error'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { completeGoal } from '../../use-cases/complete-goal'

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
    app.post(
        '/completions',
        {
            schema: {
                body: z.object({
                    goalId: z.string().cuid2(),
                }),
            },
        },
        async (request, reply) => {
            const { goalId } = request.body

            try {
                await completeGoal({ goalId })
            } catch (err) {
                if (err instanceof GoalAlreadyCompletedError) {
                    return reply.status(400).send({ message: err.message })
                }

                return reply.status(500).send()
            }

            return reply.status(201).send()
        }
    )
}

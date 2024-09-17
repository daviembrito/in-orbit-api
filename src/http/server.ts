import fastify from 'fastify'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal-route'
import { getPendingGoalsRoute } from './routes/get-pending-goals-route'
import { createGoalCompletionRoute } from './routes/create-goal-completion-route'
import { getWeekSummaryRoute } from './routes/get-week-summary-route'
import fastifyCors from '@fastify/cors'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(getPendingGoalsRoute)
app.register(createGoalCompletionRoute)
app.register(getWeekSummaryRoute)

app.listen({
    port: 3000,
}).then(() => {
    console.log('Server listening on port 3000')
})

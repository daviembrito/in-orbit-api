import fastify from 'fastify'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal-route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)

app.listen({
    port: 3000,
}).then(() => {
    console.log('Server listening on port 3000')
})

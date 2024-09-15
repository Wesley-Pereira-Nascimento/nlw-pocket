import fastify from 'fastify'
import { createGoal } from '../functions/create-goal'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'
import { getWeePendingGoals } from '../functions/get-wee-pending-goals'
import { createGoalCompetion } from '../functions/create-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async () => {
  const pendingGoals = await getWeePendingGoals()
  return pendingGoals
})

app.post(
  '/completions',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    }, 
  },
  async request => {
    const { goalId } = request.body

    await createGoalCompetion({
      goalId,
    })
    
  }
)

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        diseredWeeklyFrenquency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, diseredWeeklyFrenquency } = request.body

    await createGoal({
      title,
      diseredWeeklyFrenquency,
    })
  }
)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running')
  })

import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const goal = pgTable('goal', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    title: text('title').notNull(),
    weeklyFrequency: integer('weekly_frequency').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
})

export const goalCompletion = pgTable('goal_completion', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    goalId: text('goal_id')
        .notNull()
        .references(() => goal.id),
    completedAt: timestamp('completed_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
})

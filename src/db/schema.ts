import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const goal = pgTable('goal', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    weeklyFrequency: integer('weekly_frequency').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
})

export const goalCompletion = pgTable('goal_completion', {
    id: text('id').primaryKey(),
    goalId: text('goal_id')
        .notNull()
        .references(() => goal.id),
    completedAt: timestamp('completed_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
})

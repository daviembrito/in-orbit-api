import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const goal = pgTable('goal', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    weeklyFrequency: integer('weekly_frequency').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
})

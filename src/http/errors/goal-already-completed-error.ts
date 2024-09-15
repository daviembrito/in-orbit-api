export class GoalAlreadyCompletedError extends Error {
    constructor() {
        super('Goal already completed this week')
    }
}

export const testData = {
    tasks: [
      {
        id: '1',
        title: 'Test Task',
        text: 'Test Task Description',
        completed: false,
        project: 'Test Project',
        priority: 'medium' as const,
        summary: 'Test Summary',
        createdAt: new Date().toISOString(),
        description: 'Test Description',
        dueDate: null,
        tags: [],
        subtasks: [],
        completedAt: null,
        completedInWeek: null,
        completedInMonth: null,
        completedInYear: null,
        archived: false
      }
    ]
  };
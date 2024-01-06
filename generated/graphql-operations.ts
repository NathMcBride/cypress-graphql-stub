export const OperationToQuery = {
  getTask: ['task'] as const,
  getUser: ['user'] as const,
  getStatistics: ['statistics'] as const,
  addNote: ['addNote'] as const,

};

export type OperationToQuery = typeof OperationToQuery;
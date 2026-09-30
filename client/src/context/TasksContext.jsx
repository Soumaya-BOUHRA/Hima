import { createContext, useContext } from 'react';

const TasksContext = createContext(null);

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) throw new Error('useTasks must be used inside <TasksProvider>');
  return value;
}

export default TasksContext;

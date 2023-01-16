import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react';
import { remult } from 'remult';
import { Task } from '../src/shared/Task';
import { api } from '../src/server/api';
import { TasksController } from '../src/shared/TasksController';

async function fetchTasks(hideCompleted: boolean) {
  return remult.repo(Task).find({
    limit: 20,
    orderBy: { completed: "desc" },
    where: { completed: hideCompleted ? false : undefined }
  });
}

const Home: NextPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    fetchTasks(hideCompleted).then(setTasks);
  }, [hideCompleted]);

  const addTask = () => {
    setTasks([...tasks, new Task()])
  };

  const setAll = async (completed: boolean) => {
    await TasksController.setAll(completed);
    const taskRepo = remult.repo(Task);
  
    for (const task of await taskRepo.find()) {
      await taskRepo.save({ ...task, completed });
    }
    
    setTasks(await fetchTasks(hideCompleted));
  
  };

  return (
    <div>
      <div>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
      </div>
      <input
        type="checkbox"
        checked={hideCompleted}
        onChange={e => setHideCompleted(e.target.checked)} /> Hide Completed
      <main>
        {tasks.map(task => {
          const handlechange = (values: Partial<Task>) => {
            setTasks(tasks.map(t => t === task ? { ...task, ...values } : t));
          };

          const saveTask = async () => {
            try {
              const savedTask = await remult.repo(Task).save(task);
            setTasks(tasks.map(t => t === task ? savedTask : t));
            } catch (error: any) {
              alert(error.message);
            }
          };

          const deleteTask = async () => {
            await remult.repo(Task).delete(task);
            setTasks(tasks.filter(t => t !==task));
          }

          return (
            <div key={task.id}>
              <input type="checkbox"
                checked={task.completed}
                onChange={e => handlechange({ completed: e.target.checked })} />
              <input
                value={task.title}
                onChange={e => handlechange({ title: e.target.value })} />
                <button onClick={saveTask}>Save</button>
                <button onClick={deleteTask}>Delete</button>
            </div>
          );
        })}
      </main>
      <button onClick={addTask}>Add Task</button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get remult instance
  const remult = await api.getRemult(context);

  // Find all tasks
  const tasks = await remult.repo(Task).find();

  // Serialize tasks into plain object
  const tasksJson = JSON.parse(JSON.stringify(tasks));

  return { props: { tasks: tasksJson } };
};

export default Home

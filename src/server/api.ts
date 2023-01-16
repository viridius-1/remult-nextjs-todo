import { remult } from "remult";
import { createRemultServer } from "remult/server";
import { Task } from '../shared/Task';
import { TasksController } from "../shared/TasksController";

export const api = createRemultServer({
    entities: [Task],
    initApi: async remult => {
        const taskRepo = remult.repo(Task);
        if (await taskRepo.count() === 0) {
            await taskRepo.insert([
                { title: "Task a" },
                { title: "Task b", completed: true },
                { title: "task c" },
                { title: "task d" },
                { title: "task e", completed: true }
            ]);
        }
    },
    controllers: [TasksController]
})

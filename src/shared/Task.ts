import { Entity, Fields, Validators } from "remult";

@Entity("tasks", {
    allowApiCrud: true
})

export class Task {
    @Fields.uuid()
    id!: string;

    @Fields.string<Task>({
        validate: (task) => {
            if (task.title.length < 3)
                throw "Too Short";
            if (task.title.length > 20)
                throw "Too Long";
        }
    })
    title = '';

    @Fields.boolean()
    completed = false;
}
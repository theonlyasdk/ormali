/**
 * This script contains the logic for Ormali
 */

const generate_uuid = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    )
}

class Task {
    constructor(name, content, date, done) {
        this.name = name
        this.content = content
        this.date = date
        this.done = done
        this.id = generate_uuid()
    }

    from_json(json) {
        this.name = json['name']
        this.content = json['content']
        this.date = json['date']
        this.done = json['done'] !== undefined ? json['done'] : false
        this.id = json['id']
    }

    as_object() {
        return {
            name: this.name,
            content: this.content,
            date: this.date,
            done: this.done,
            id: this.id
        }
    }

    build_html() {
        let btn_done_color = this.done ? "btn-secondary" : "btn-primary";
        let btn_done_icon = this.done ? "bi-check-all" : "bi-check";

        return `
            <div class="card task" style="width: 18rem" id="task-${this.id}">
                <div class="card-body">
                    <div class="card-text-content"> 
                        <h5 class="card-title display-6"><b>${this.name}</b></h5>
                        <p class="card-text">${this.content}</p>
                    </div>
                    <div class="card-btn-container">
                        <a href="#" class="btn ${btn_done_color} task-btn-done" onclick="task_list.mark_done('${this.id}')"><i class="bi ${btn_done_icon}"></i></a>                
                        <a href="#" class="btn btn-danger task-btn-delete" onclick="task_list.remove('${this.id}')"><i class="bi bi-trash-fill"></i></a>                
                    </div>
                </div>
            </div>
        `
    }
}

class TaskList {
    static get_task_list_container() {
        return document.getElementById("tasks-container")
    }

    constructor() {
        this.tasks = []
        this.no_tasks_message = document.getElementById("no-tasks")
    }

    toggle_visibility_of_no_tasks_placeholder() {
        this.no_tasks_message.style.display = this.tasks.length <= 0 ? "flex" : "none"
    }

    add(task) {
        this.tasks.push(task)
        this.toggle_visibility_of_no_tasks_placeholder()
    }

    remove(task_id) {
        this.tasks = this.tasks.filter(item => item.id !== task_id)

        let task_to_remove = document.getElementById(`task-${task_id}`)
        if (task_to_remove) {
            task_to_remove.remove()
            this.toggle_visibility_of_no_tasks_placeholder()
            this.save_into_local_storage()
        }
    }

    get(index) {
        return this.tasks[index]
    }

    mark_done(task_id) {
        let task_to_mark_done = this.tasks.find(item => item.id === task_id)
        let task_btn_done = document.querySelector(`#task-${task_id} .card-body > .card-btn-container > a.task-btn-done`)
        let task_btn_done_icon = document.querySelector(`#task-${task_id} .card-body > .card-btn-container > a.task-btn-done > i.bi`)

        task_to_mark_done.done = true

        if (task_btn_done) {
            task_btn_done.classList.remove("btn-primary")
            task_btn_done.classList.add("btn-secondary")

            task_btn_done_icon.classList.remove("bi-check")
            task_btn_done_icon.classList.add("bi-check-all")
        }

        this.save_into_local_storage()
    }
    build_html() {
        let html = ""

        for (const task of this.tasks) {
            html += task.build_html()
        }

        return html
    }

    flush_to_page(container) {
        this.toggle_visibility_of_no_tasks_placeholder()
        if (container) container.innerHTML = this.build_html()
    }

    load_from_local_storage() {
        const tasksJSON = localStorage.getItem("ormali_tasks")
        if (tasksJSON) {
            try {
                const tasks = JSON.parse(tasksJSON)
                this.tasks = tasks.map(task_json => {
                    const task = new Task()
                    task.from_json(task_json)
                    return task
                })
                this.toggle_visibility_of_no_tasks_placeholder()
            } catch (error) {
                console.error("Error loading tasks from local storage:", error)
            }
        }
    }

    save_into_local_storage() {
        const tasksJSON = JSON.stringify(this.tasks.map(task => task.as_object()))
        localStorage.setItem("ormali_tasks", tasksJSON)
    }
}

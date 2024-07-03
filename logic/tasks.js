/**
 * This file contains logic for task cards
 */


/**
 * Generates a UUID v4
 *
 * @return {string} A UUID v4
 */
const generate_uuid = () => {
    // Generates a UUID v4 using the Math.random() function
    // Source: https://stackoverflow.com/a/2117523
    return "10000000-1000-4000-8000-100000000000"
        .replace(/[018]/g, c =>
            // Generates a random hexadecimal digit
            // Source: https://stackoverflow.com/a/6248722
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
}

const check_state = (value) => value ? "checked" : ""

class Task {
    constructor(id, name, content, date, done, checklist) {
        this.id = id
        this.name = name
        this.content = content
        this.date = date
        this.done = done
        this.checklist = checklist
    }

    from_json(json) {
        this.id = json['id']
        this.name = json['name']
        this.content = json['content']
        this.date = json['date']
        this.done = json['done']
        this.checklist = json['checklist']
    }

    as_object() {
        return {
            id: this.id,
            name: this.name,
            content: this.content,
            date: this.date,
            done: this.done,
            checklist: this.checklist,
        }
    }

    build_html() {
        let btn_done_color = this.done ? "btn-secondary" : "btn-primary"
        let btn_done_icon = this.done ? "bi-check-all" : "bi-check"

        return `
            <div class="card task" style="width: 18rem" id="task-${this.id}">
                <div class="card-body">
                    <div class="card-text-content mb-2"> 
                        <h5 class="card-title display-6"><b>${this.name}</b></h5>
                        <p class="card-text">${this.content}</p>
                    </div>
                    <div class="mb-2">
                    ${Object.entries(this.checklist).map(([id, item]) => `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" ${check_state(item.checked)} value="" id="checklist-${this.id}-${id}" onclick="task_list.toggle_check_state('${id}', '${this.id}')">
                            <label class="form-check-label" for="checklist-${this.id}-${id}">
                                ${id}. ${item.content}
                            </label>
                        </div>
                    `).join('')}
                    </div>
                    <div class="card-bottom">
                        <small class="task-date"><i>Created on ${this.date}</i></small>
                        <div class="card-btn-container">
                            <button class="btn task-btn ${btn_done_color} 
                                    task-btn-done" 
                                    onclick="task_list.mark_done('${this.id}')"
                                    title="Mark as done">
                                <i class="bi ${btn_done_icon}"></i>
                            </button>
                            <button class="btn task-btn ${btn_done_color} 
                                    task-btn-copy" 
                                    onclick="task_list.copy_content('${this.id}')"
                                    title="Copy content">
                                <i class="bi bi-clipboard-fill"></i>
                            </button>
                            <button class="btn task-btn btn-primary" 
                                    onclick="dialog_new_task.show('${this.id}')"
                                    title="Edit task">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn task-btn btn-danger task-btn-delete" 
                                    onclick="task_list.remove('${this.id}')"
                                    title="Delete task">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
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

    set_check_state(check_id, task_id, state) {
        const task = this.tasks.filter(task => task.id === task_id)[0]
        const checkbox = task.checklist[check_id]

        if (checkbox) {
            checkbox.checked = state
        }

        this.save_into_local_storage()
    }

    get_check_state(check_id, task_id) {
        const task = this.tasks.filter(task => task.id === task_id)[0]
        const checkbox = task.checklist[check_id]

        if (checkbox) {
            return checkbox.checked
        }

        return false
    }

    toggle_check_state(check_id, task_id) {
        this.set_check_state(check_id, task_id, !this.get_check_state(check_id, task_id))
    }

    copy_content(id) {
        const task = this.tasks.find(task => task.id === id)
        if (task) {
            navigator.clipboard.writeText(task.content)
        }
    }

    clear() {
        if (!confirm("Clear tasks?")) return

        this.tasks = []
        TaskList.get_task_list_container().innerHTML = ""
        this.toggle_visibility_of_no_tasks_placeholder()
        this.save_into_local_storage()
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
        let task_done_status = task_to_mark_done.done
        let task_btn_done = document.querySelector(`#task-${task_id} .card-body > .card-bottom > .card-btn-container > button.task-btn-done`)
        let task_btn_done_icon = document.querySelector(`#task-${task_id} .card-body > .card-bottom > .card-btn-container > button.task-btn-done > i.bi`)

        // Toggle the 'done' status of the task
        task_to_mark_done.done = !task_done_status

        task_btn_done.classList.toggle("btn-primary")
        task_btn_done.classList.toggle("btn-secondary")
        task_btn_done_icon.classList.toggle("bi-check")
        task_btn_done_icon.classList.toggle("bi-check-all")

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

    filter_tasks(filter) {
        const tasks = document.querySelectorAll('#tasks-container .task')
        tasks.forEach(task => {
            task.classList.remove('d-none')
            const title = task.querySelector('.card-title').innerText.toLowerCase()
            if (!title.includes(filter)) {
                task.classList.add('d-none')
            }
        })
    }

    reset_search_filters() {
        const allTasks = document.querySelectorAll('#tasks-container .task.d-none')
        allTasks.forEach(task => task.classList.remove('d-none'))
    }
}

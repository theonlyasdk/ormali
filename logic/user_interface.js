/**
 * This file contains the logic for user interface related functionality
 */

// TODO: Move all dialog related functions into a base class and
//       inherit all dialog related classes from it
class InputDialog {
    constructor(title, message, btn_confirm_text, input_placeholder) {
        this.dialog = document.getElementById("dialog-input")
        this.text_title = document.getElementById("dialog-input-title")
        this.text_message = document.getElementById("dialog-input-message")
        this.field_input = document.getElementById("dialog-input-textfield")
        this.btn_confirm = document.getElementById("dialog-input-btn-confirm")
        this.btn_close = document.getElementById("dialog-input-btn-close")
        this.dialog_dim_overlay = document.getElementById("dialog-dim-overlay")

        this.text_title.innerHTML = title
        this.text_message.innerHTML = message
        this.btn_confirm.innerHTML = btn_confirm_text
        this.field_input.placeholder = input_placeholder
    }

    show() {
        this.dialog_dim_overlay.style.display = "block"
        this.dialog.show()
        this.dialog.classList.remove("dialog-anim-closing")
        this.dialog.classList.add("dialog-anim-opening")
    }

    close() {
        this.dialog_dim_overlay.style.display = "none"
        this.dialog.classList.remove("dialog-anim-opening")
        this.dialog.classList.add("dialog-anim-closing")
        this.dialog.close()
        this.on_dialog_close()
    }

    get_value() {
        return this.field_input.value
    }

    set_on_dialog_close = (event) => { this.on_dialog_close = event }
    set_dialog_trigger = (element) => { this.dialog_trigger = element }
    registerEvents() {
        this.dialog_trigger.addEventListener('click', () => this.show());
        this.btn_confirm.addEventListener('click', () => this.close());
        this.dialog.addEventListener('keydown', ({ key }) => {
            if (key === 'Escape' && this.dialog.open) {
                this.close();
            }
        });
        this.btn_close.addEventListener('click', () => this.close());
    }
}
class NewTaskDialog {
    constructor(default_title = "") {
        this.default_title = default_title
        this.dialog_container = document.getElementById("container-dialog-new-task")
        this.dialog = document.getElementById("dialog-new-task")
        this.dialog_heading = document.getElementById("dialog-heading")
        this.btn_confirm = document.getElementById("dialog-new-task-btn-confirm")
        this.btn_close = document.getElementById("dialog-new-task-btn-close")
        this.btn_open_dialog = document.getElementById("btn-trigger-new-task-dialog")
        this.btn_generate_tasks = document.getElementById("dialog-new-task-btn-generate-tasks")
        this.dialog_dim_overlay = document.getElementById("dialog-dim-overlay")
        this.dialog_new_task_form = document.getElementById("dialog-new-task-form")
        this.field_title = document.getElementById("dialog-new-task-title")
        this.field_content = document.getElementById("dialog-new-task-content")
        this.text_btn_generate_tasks = document.getElementById("btn-generate-tasks-text")
        this.alert_error = document.getElementById("dialog-new-task-alert-error")
        this.alert_warning = document.getElementById("dialog-new-task-alert-warning")
        this.alert_error.style.display = "none"
        this.alert_warning.style.display = "none"
        this.checklist_container = document.getElementById("dialog-new-task-checklist-container")
        this.checklist_container_loading = document.getElementById("dialog-new-task-content-generating")

        this.checklist_container.innerHTML = ''
        this.checklist = {}
    }

    show(task_id) {
        this.dialog_dim_overlay.style.display = "block"
        this.dialog.show()
        this.dialog.classList.remove("dialog-anim-closing")
        this.dialog.classList.add("dialog-anim-opening")
        task_id ? this.edit_task_dialog(task_id) : this.new_task_dialog()
    }

    new_task_dialog() {
        this.dialog.removeAttribute('data-id');
        this.field_content.value = ""
        this.field_title.value = ""
        this.dialog_heading.innerText = 'Add new task...';
    }

    edit_task_dialog(task_id) {
        this.dialog.setAttribute('data-id', task_id)
        const task_to_edit = task_list.tasks.find(task => task.id == task_id);
        this.field_title.value = task_to_edit.name;
        this.field_content.value = task_to_edit.content;
        this.dialog_heading.innerText = 'Edit task...';
    }

    close() {
        this.dialog_dim_overlay.style.display = "none"
        this.dialog.classList.remove("dialog-anim-opening")
        this.dialog.classList.add("dialog-anim-closing")
        this.dialog.close()
    }

    register_events() {
        this.btn_confirm.addEventListener("click", () => {
            this.close()
            this.on_dialog_close()
        })
        this.btn_open_dialog.addEventListener("click", () => this.show())
        this.dialog.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.dialog.open) {
                this.close()
            }
        })
        this.dialog_new_task_form.addEventListener("submit", (e) => {
            e.preventDefault()
            this.close()
            this.on_dialog_close()
        })
        this.btn_close.addEventListener("click", () => {
            this.close()
        })
        this.btn_generate_tasks.addEventListener('click', (e) => {
            let prev_text_val = this.text_btn_generate_tasks.innerHTML

            this.text_btn_generate_tasks.innerHTML = "Generating..."
            this.btn_generate_tasks.classList.add("btn-content-generating")
            this.btn_generate_tasks.disabled = true

            this.handle_generate_content().then(() => {
                this.btn_generate_tasks.classList.remove("btn-content-generating")
                this.btn_generate_tasks.disabled = false
                this.text_btn_generate_tasks.innerHTML = prev_text_val
            })
        })
    }

    show_error(error) {
        this.alert_error.style.display = "block"
        this.alert_error.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i>&nbsp&nbsp${error}`
    }

    hide_error() {
        this.alert_error.style.display = "none"
        this.alert_error.innerHTML = ""
    }

    show_warning(error) {
        this.alert_warning.style.display = "block"
        this.alert_warning.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i>&nbsp&nbsp${error}`

        setTimeout(() => this.hide_warning(), 4000)
    }

    hide_warning() {
        this.alert_warning.style.display = "none"
        this.alert_warning.innerHTML = ""
    }

    set_on_dialog_close = (event) => { this.on_dialog_close = event }

    async handle_generate_content() {
        if (!window.gen_ai) {
            this.show_error("Gemini API failed to initialize. Reload this page and and try again.")
            return
        }
        if (this.field_title.value == "") {
            this.show_warning("Enter a title to generate tasks.")
            return
        }

        this.hide_error()
        this.hide_warning()

        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        const model = window.gen_ai.getGenerativeModel({ model: "gemini-1.5-flash" })

        // If the content generation shows something irrelevant, tell it not to by adding to the lines below
        const prompt_rules = `
            1. Do not use markdown. Instead use ASCII/Unicode characters.
            2. Only produce task content. Do not produce any system messages or any other kind of non-task text
            3. Tasks should be precise and accurate. It should be very brief.
            4. Observe what's written in the title and create the task accordingly
            5. Your task is to create todo tasks. Do not do anything else.
            6. Avoid using markdown and instead use ASCII or unicode characters.
            7. Never use **text** or __**text**__ or __text__ to format anything.
            8. Always use numbers for lists, not - dashes
        `
        const prompt = `Create content for a todo task based on the following title: '${this.field_title.value}'. ${prompt_rules}`

        try {
            this.checklist_container.innerHTML = ''
            this.checklist_container_loading.style.display = 'flex'
            this.field_content.style.display = 'none'
            this.field_content.value = ""

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const lines = text.split("\n")

            lines.forEach(line => {
                const match = line.match(/^(\d+)\.\s+(.*)$/)
                if (match) {
                    const number = parseInt(match[1])
                    const value = match[2]
                    this.checklist[number] = value
                    const checkbox = document.createElement("div")
                    checkbox.classList.add("form-check")
                    const input = document.createElement("input")
                    input.type = "checkbox"
                    input.classList.add("form-check-input")
                    input.id = `dialog-new-task-checklist-${number}`
                    input.value = value
                    const label = document.createElement("label")
                    label.classList.add("form-check-label")
                    label.htmlFor = `dialog-new-task-checklist-${number}`
                    label.innerHTML = value
                    checkbox.appendChild(input)
                    checkbox.appendChild(label)
                    this.checklist_container.appendChild(checkbox)
                }
            })

            this.checklist_container_loading.style.display = 'none'

            if (checklist.length > 0) {
                this.field_content.style.display = 'none'
            }

            this.field_content.value = text
            this.field_content.scrollTop = this.field_content.scrollHeight

        } catch (error) {
            if (error.toString().includes("API key not valid. Please pass a valid API key.")) {
                this.show_error("Invalid Gemini API key. Please set it in the settings!")
            }
        }
    }
}

const init_bootstrap = () => {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
}

init_bootstrap()

let task_list = new TaskList()
let loader = new MoreAppsLoader("https://raw.githubusercontent.com/theonlyasdk/libasdk/main/web/data/more_apps_list.json")
loader.load()

let dialog_trigger = document.getElementById("dialog-input-api-key-trigger")
if (!window.is_using_mobile_device()) {
    let dialog_message = `Go to <a href="https://aistudio.google.com/app/">https://aistudio.google.com/app/</a> to obtain your API key.`
    let dialog_get_api_key = new InputDialog("Enter API Key", dialog_message, "Save", "Paste your Gemini API key here...")

    dialog_get_api_key.set_dialog_trigger(dialog_trigger)
    dialog_get_api_key.set_on_dialog_close(() => {
        if (dialog_get_api_key.field_input.value == "") return
        localStorage.setItem("ormali.generativeai.gemini.api_key", dialog_get_api_key.field_input.value)
        window.location.reload()
    })
    dialog_get_api_key.registerEvents()
} else {
    dialog_trigger.addEventListener('click', () => {
        const key = prompt('Enter Gemini API key');
        if (key) {
            localStorage.setItem('ormali.generativeai.gemini.api_key', key);
            window.location.reload();
        }
    });
}

let dialog_new_task = new NewTaskDialog()
dialog_new_task.register_events()

dialog_new_task.set_on_dialog_close(() => {
    if ((!check_not_null_or_empty(dialog_new_task.field_content.value) && dialog_new_task.checklist.length == 0) ||
        !check_not_null_or_empty(dialog_new_task.field_title.value)) return

    // if dialog has id, we need to edit task.
    const task_id = dialog_new_task.dialog.dataset.id

    if (task_id) {
        const task_to_edit = task_list.tasks.find(task => task.id == task_id)

        task_to_edit.checklist = dialog_new_task.checklist
        task_to_edit.name = dialog_new_task.field_title.value
        task_to_edit.content = dialog_new_task.field_content.value

    } else {
        task_list.add(new Task(dialog_new_task.field_title.value,
            dialog_new_task.field_content.value,
            new Date().toISOString().split('T')[0],
            false,
            dialog_new_task.checklist))
    }

    task_list.flush_to_page(TaskList.get_task_list_container())
    task_list.save_into_local_storage()
})

task_list.load_from_local_storage()
task_list.flush_to_page(TaskList.get_task_list_container())

const task_search = document.getElementById('task-search');
task_search.addEventListener('keyup', (e) => {
    e.preventDefault();
    const userInput = document.querySelector('.field-search').value.trim().toLowerCase();
    if (userInput !== '') {
        task_list.filter_tasks(userInput);
    } else {
        task_list.reset_search_filters();
    }
});

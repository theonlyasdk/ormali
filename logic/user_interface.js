
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
    register_events() {
        this.dialog_trigger.addEventListener('click', () => this.show())
        this.btn_confirm.addEventListener('click', () => this.close())
        this.dialog.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.dialog.open) {
                this.close()
            }
        })
        this.btn_close.addEventListener("click", () => {
            this.close()
        })
    }
}
class NewTaskDialog {
    constructor(default_title = "") {
        this.default_title = default_title
        this.dialog_container = document.getElementById("container-dialog-new-task")
        this.dialog = document.getElementById("dialog-new-task")
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
    }

    show() {
        this.dialog_dim_overlay.style.display = "block"
        this.dialog.show()
        this.dialog.classList.remove("dialog-anim-closing")
        this.dialog.classList.add("dialog-anim-opening")

        this.field_content.value = ""
        this.field_title.value = ""
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

        setTimeout(() => {
            this.hide_warning()
        }, 4000)
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

        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        const model = window.gen_ai.getGenerativeModel({ model: "gemini-1.5-flash" })

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
            const result = await model.generateContentStream(prompt)

            this.field_content.value = ""

            for await (const chunk of result.stream) {
                const chunkText = chunk.text()

                this.field_content.scrollTop = this.field_content.scrollHeight
                this.field_content.value += chunkText
            }
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
    dialog_get_api_key.register_events()
} else {
    dialog_trigger.addEventListener('click', () => {
        let value = prompt('Enter Gemini API key')
        if (value == "") return
        localStorage.setItem("ormali.generativeai.gemini.api_key", value)
        window.location.reload()
    })
}

let dialog_new_task = new NewTaskDialog()
dialog_new_task.register_events()
dialog_new_task.set_on_dialog_close(() => {
    if (!check_not_null_or_empty(dialog_new_task.field_content.value) ||
        !check_not_null_or_empty(dialog_new_task.field_title.value)) return

    task_list.add(new Task(dialog_new_task.field_title.value, dialog_new_task.field_content.value, Date.now(), false))
    task_list.flush_to_page(TaskList.get_task_list_container())
    task_list.save_into_local_storage()
})

task_list.load_from_local_storage()
task_list.save_into_local_storage()
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

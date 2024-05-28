class NewTaskDialog {
    constructor(default_title = "") {
        this.default_title = default_title
        this.dialog_container = document.getElementById("container-dialog-new-task")
        this.dialog = document.getElementById("dialog-new-task")
        this.btn_confirm = document.getElementById("dialog-new-task-btn-confirm")
        this.btn_open_dialog = document.getElementById("btn-trigger-new-task-dialog")
        this.dialog_dim_overlay = document.getElementById("dialog-dim-overlay")
        this.dialog_new_task_form = document.getElementById("dialog-new-task-form")
        this.field_title = document.getElementById("dialog-new-task-title")
        this.field_content = document.getElementById("dialog-new-task-content")
    }

    show() {
        this.dialog_dim_overlay.style.display = "block"
        this.dialog.show()
        this.dialog.classList.remove("dialog-anim-closing")
        this.dialog.classList.add("dialog-anim-opening")

        this.field_content.value = "";
        this.field_title.value = "";
    }

    close() {
        this.dialog_dim_overlay.style.display = "none"
        this.dialog.classList.remove("dialog-anim-opening")
        this.dialog.classList.add("dialog-anim-closing")
        this.dialog.close()
        this.on_dialog_close()
    }

    register_events() {
        this.btn_confirm.addEventListener("click", () => {
            this.close()
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
        })
    }

    set_on_dialog_close = (event) => { this.on_dialog_close = event }
}

let task_list = new TaskList()
let loader = new MoreAppsLoader("https://raw.githubusercontent.com/theonlyasdk/libasdk/main/web/data/more_apps_list.json")
loader.load()

let dialog = new NewTaskDialog()
dialog.register_events()
dialog.set_on_dialog_close(() => {
    if (!check_not_null_or_empty(dialog.field_content.value) ||
        !check_not_null_or_empty(dialog.field_title.value)) return;

    task_list.add(new Task(dialog.field_title.value, dialog.field_content.value, Date.now(), false))
    task_list.flush_to_page(TaskList.get_task_list_container())
    task_list.save_into_local_storage()
})

task_list.load_from_local_storage()
task_list.save_into_local_storage()
task_list.flush_to_page(TaskList.get_task_list_container())

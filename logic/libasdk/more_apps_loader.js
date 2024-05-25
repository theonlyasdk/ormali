/**
 * More apps template (Bootstrap 5 required)
 * Put this in your <nav>
 --------------------------------------------------- 
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            More Apps
        </a>
        <ul class="dropdown-menu" id="more-apps-list">
            <!-- Content will be loaded dynamically by more_apps_loader.js -->
            <li>
                <hr class="dropdown-divider">
            </li>
            <li>
                <a class="dropdown-item check-out-more-apps" 
                   href="https://github.com/theonlyasdk/">
                    <small><i><b>Check out more apps on GitHub!!!</b></i></small>
                </a>
            </li>
        </ul>
    </li>
 ----------------------------------------------------
 */
let logger = new Logger("LibASDK More Apps List");

/**
 * Checks if a string is not undefined, null, or empty.
 * @param string - The function takes a string as a parameter and checks if
 * the string is not undefined, not null, and not empty. It returns `true` if the string meets all
 * these conditions, and `false` otherwise.
 * @returns The function is returning a boolean value based on whether the
 * input string is not undefined, not null, and not an empty string.
 */
const check_not_null_or_empty = (string) => {
    return string !== undefined && string !== null && string !== "";
}

/* The `MoreAppsLoader` class fetches a list of more apps from a specified URL and populates a
container with the app names, descriptions, and URLs. */
class MoreAppsLoader {
    constructor(url) { this.url = url; }

    load = () => {
        fetch(this.url)
            .then((response) => {
                return response.json();
            }).then((json) => {
                this.propogate(json);
            })
            .catch((error) => {
                logger.error(`Unable to fetch ${this.url}: ${error}`);
            });
    }

    propogate = (more_apps_list) => {
        if (more_apps_list == {}) {
            logger.error("Skipping more apps list propogation because more apps list is empty...");;
            return;
        }
    
        more_apps_list.forEach(element => {
            let name = element['name'];
            let description = element['description'];
            let url = element['url'];
    
            if (!check_not_null_or_empty(name) ||
                !check_not_null_or_empty(description) ||
                !check_not_null_or_empty(url)) return;
    
            let more_apps_item_template = `
                <li>
                    <a class="dropdown-item more-apps-item" href="${url}" title="${description}">
                        <b>${name}</b>
                        <br>
                        <small>${description}</small>
                    </a>
                </li>
            `;
            let more_apps_list_container = document.getElementById("more-apps-list");
    
            // Prepend element before the rest of the elements
            more_apps_list_container.innerHTML = more_apps_item_template + more_apps_list_container.innerHTML;
        });
    }    
}


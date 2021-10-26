function base_url() {
    return `${window.location.origin}/cookbook`;
}

function api_call(method, appended_url, callback) {
    let xhr = new XMLHttpRequest();
    let url = `${base_url()}${appended_url}`;
    xhr.withCredentials = true;
    xhr.open(method, url, true);
    xhr.onload = (e) => {
        if (xhr.status == 200) {
            callback(xhr.response);
        } else if (xhr.status == 302) {
            console.log(xhr)
            callback(undefined);
        } else {
            callback(undefined);
        }
    }
    xhr.onerror = (e) => {
        callback(undefined);
    }
    xhr.send(null);
}

function get_recipes() {
    api_call("GET", "/api/recipe", (res) => {
        let json = JSON.parse(res);
        console.log(json);
        json.forEach(elem => {
            console.log(elem);
        })
    })
}
let keycloak;
let recipes;
let recipe;

function base_url() {
    return `${window.location.origin}/cookbook`;
}

async function initKeycloak(callback) {
    let conf = {
      url: 'https://asky.hopto.org/auth',
      realm: 'cookbook-realm',
      clientId: 'cookbook-client'
    }
    keycloak = new Keycloak(conf);
    keycloak.init({onLoad:"login-required"}).then(function(authenticated) {
      console.log(authenticated ? 'authenticated' : 'not authenticated');
      if (callback) callback();
    }).catch(function() {
      alert('failed to initialize');
    });
    //      console.log(JSON.stringify(await keycloak.loadUserProfile(), null, " "));
}

function api_call(method, appended_url, callback) {
    let xhr = new XMLHttpRequest();
    let url = `${base_url()}${appended_url}`;
    console.log("invoked " + url);
    xhr.open(method, url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
    xhr.onload = (e) => {
        if (xhr.status == 200) {
            callback(xhr);
        } else {
            callback(undefined);
        }
    }
    xhr.onerror = (e) => {
        callback(undefined);
    }
    xhr.send();
}

function goto_add() {
    window.location.href = base_url() + "/edit-recipe.html";
}

function goto_edit() {
    window.location.href = base_url() + "/edit-recipe.html?rid=" + recipe.id;
}

function render_recipes() {
    let recipe_list = document.getElementById("recipe_list");
    let recipe_template = document.getElementById("recipe_template");
    while (recipe_list.firstChild) {
        recipe_list.removeChild(recipe_list.lastChild);
    }
    recipes.forEach(elem => {
        let clone = recipe_template.cloneNode(true);
        clone.id = undefined;
        clone.style = "display;";
        clone.addEventListener("click", () => {
            window.location.href = base_url() + "/recipe.html?rid=" + elem.id;
        })
        clone.childNodes.forEach(first_node => {
            first_node.childNodes.forEach(second_node => {
                if (second_node.textContent && second_node.tagName != "BUTTON") {
                    second_node.textContent = elem[second_node.textContent];
                }
            })
            
        })
        recipe_list.insertBefore(clone, recipe_list.firstChild);
    })
}

function render_recipe() {
    let recipe_template = document.getElementById("recipe_template");
    recipe_template.style = "display;"
    recipe_template.childNodes.forEach(node => {
        if (node.textContent && node.tagName != "BUTTON") {
            node.textContent = recipe[node.textContent];
        }
    })
}

function get_recipes() {
    api_call("GET", "/api/recipe", (xhr) => {
        if (xhr) {
            recipes = JSON.parse(xhr.response);
            recipes.sort((a, b) => {a.title > b.title ? 1 : -1})
            render_recipes();
        }
    })
}

function get_recipe() {
    urlp=[];s=location.toString().split('?');s=s[1].split('&');for(i=0;i<s.length;i++){u=s[i].split('=');urlp[u[0]]=u[1];}
    api_call("GET", "/api/recipe?rid=" + urlp["rid"], (xhr) => {
        if (xhr) {
            recipe = JSON.parse(xhr.response);
            render_recipe();
        }
    })
}

function search() {
    let text = document.getElementById("search_input").value;
    let scores = [];
    recipes.forEach(elem=> {
        let score = 0;
        for (let prop in elem) {
            let value = elem[prop].toString();
            if (prop.search(text) >= 0) score += 10;
            for (var i = 0; i < text.length; i++) {
                if (prop.search(text.charAt(i)) >= 0) score += (1 / elem[prop].length);
            }
        }
        elem.score = score;
        console.log(score);
    });
    recipes.sort((a, b) => {a.score > b.score ? 1 : -1})
    render_recipes();
}
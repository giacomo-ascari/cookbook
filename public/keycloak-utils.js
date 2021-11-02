let keycloak;

async function init_keycloak(callback) {
    let conf = {
        url: 'https://asky.hopto.org/auth',
        realm: 'cookbook-realm',
        clientId: 'cookbook-client'
    }
    keycloak = new Keycloak(conf);
    keycloak.init({onLoad:"login-required"}).then(function(authenticated) {
        console.log(authenticated ? 'authenticated' : 'not authenticated');
        if (callback) callback();
    }).catch(function(err) {
        console.log(err);
        alert('failed to initialize');
    });
    //console.log(JSON.stringify(await keycloak.loadUserProfile(), null, " "));
}

function api_call(method, appended_url, callback, body_content=undefined) {
    let xhr = new XMLHttpRequest();
    let url = `${base_url()}${appended_url}`;
    xhr.open(method, url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
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
    if (body_content) {
        xhr.send(JSON.stringify(body_content));
    } else {
        xhr.send();
    }
}
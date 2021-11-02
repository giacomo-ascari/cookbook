// IMPORTS
import log from "./utils/log";
import delay from './utils/delay';
import uuid from "./utils/uuid";

import express, { json } from "express";
// helmet, morgan, compress
import https from "https";
import cors from 'cors';


import session from 'express-session';
import Keycloak from 'keycloak-connect';

import "reflect-metadata";
import * as db from "typeorm";

import Recipe from "./entity/recipe";

// ROUTING STUFF
let router: express.Router = express.Router();

router.use(cors());
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// SESSION + KEYCLOAK
let memoryStore = new session.MemoryStore();
let keycloak = new Keycloak({store: memoryStore});

router.use(session({
    secret: process.env.STORE_SECRET as unknown as string,
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

router.use(keycloak.middleware({logout:"/logout"}));
router.use("", express.static("public"));

// INITIALIZE MODULE
export async function init(stop = false) {
    // CONNECTION TO DB
    let conn: db.Connection | undefined;
    try {
        conn = await db.createConnection();
        log("worker", `WPID: ${process.pid}\n\tTypeORM connection established`);
        return;
    } catch (error) {
        log("worker", `WPID: ${process.pid}\n\tTypeORM connection error: ${error}`, "e")
        return error;
    }
}

// WELCOMING REQUEST
router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    let info: string = `${req.method} ${req.originalUrl}\n\tFROM: ${req.ip} | TIME: ${new Date().toISOString()}\n\tWPID: ${process.pid}`;
    if (req.headers)
        for (const prop in req.headers)
            //if (!config.ignorable_headers.some(x => x == prop))
                info += `\n\tHEADER: ${prop}:${req.headers[prop]}`;
    if (req.query) info += "\n\tQUERY: " + JSON.stringify(req.query);
    if (req.body) info += "\n\tBODY: " + JSON.stringify(req.body);
    if (req.session) info += "\n\tSESSION: " + JSON.stringify(req.session);
    if (req.cookies) info += "\n\tCOOKIES: " + JSON.stringify(req.cookies);
    log("worker", info);
    next();
});

// BASE URL
/*router.get("", async (req: express.Request, res: express.Response) => {
    res.status(200).send('Benvenuti al Ricettario')
});*/

// TEST FUNCTION
router.get("/api/test", async (req: express.Request, res: express.Response) => {
    await delay(100);
    res.status(200).send('Test Ok')
});

router.get("/api/test-auth", keycloak.protect(), async (req: express.Request, res: express.Response) => {
    await delay(100);
    res.status(200).send('Test Auth Ok')
});

/*
router.get("/login", async (req: express.Request, res: express.Response) => {
    try {
        let username = req.query["username"]  as string;
        let password = req.query["password"]  as string;
        let options = {
            hostname: process.env.HOSTNAME,
            port: 443,
            path: `/auth/realms/${process.env.REALM}/protocol/openid-connect/token`,
            method: 'POST'
          };
        let request = https.request(options, (response) => {
            res.json(response);
        }).on('error', (e) => {
            throw new Error();
        });
        request.setHeader("Content-Type", "application/x-www-form-urlencoded");
        request.write(`grant_type=password`);
        request.write(`&client_id=${process.env.RESOURCE}`);
        request.write(`&client_secret=${process.env.SECRET}`);
        request.write(`&username=${username}`);
        request.write(`&password=${password}`);
        request.end();
    } catch (exc) {
        res.status(500).send("Errore generico in POST recipe");
    }
});*/

// CRUD
router.post("/api/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
    try {
        let recipe: Recipe = new Recipe();
        recipe.title = req.body.title;
        recipe.subtitle = req.body.subtitle;
        recipe.from = req.body.from;
        recipe.ingredients = req.body.ingredients;
        recipe.method = req.body.method;
        recipe.notes = req.body.notes;
        let repo = db.getRepository(Recipe);
        recipe = await repo.save(repo.create(recipe));
        res.json(recipe);
    } catch (exc) {
        res.status(500).send("Errore generico in POST recipe");
    }
});

router.get("/api/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
    try {
        let query: string = "rid";
        let id: number | undefined = req.query[query]  as number | undefined;
        let repo = db.getRepository(Recipe);
        if (id) {
            let recipe = await repo.findOne(id);
            if (recipe) {
                res.json(recipe);
            } else {
                res.status(404).send("Recipe id non trovato nel db");
            }
        } else {
            let recipes = await repo.find();
            res.json(recipes);
        }
    } catch (exc) {
        res.status(500).send("Errore generico in GET recipe");
    }
});

router.put("/api/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
    try {
        let query: string = "rid"
        let id: number | undefined = req.query[query]  as number | undefined;
        let repo = db.getRepository(Recipe);
        if (id) {
            let recipe = await repo.findOne(id);
            if (recipe) {
                recipe.title = req.body.title ? req.body.title : recipe.title;
                recipe.subtitle = req.body.subtitle ? req.body.subtitle : recipe.subtitle;
                recipe.from = req.body.from ? req.body.from : recipe.from;
                recipe.ingredients = req.body.ingredients ? req.body.ingredients : recipe.ingredients;
                recipe.method = req.body.method ? req.body.method : recipe.method;
                recipe.notes = req.body.notes ? req.body.notes : recipe.notes;
                recipe = await repo.save(recipe);
                res.json(recipe);
            } else {
                res.status(404).send("Recipe id non trovato nel db");
            }
        } else {
            res.status(400).send("Recipe id mancante");
        }
    } catch (exc) {
        res.status(500).send("Errore generico in PUT recipe");
    }
});

router.delete("/api/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
    try {
        let query: string = "rid";
        let id: number | undefined = req.query[query]  as number | undefined;
        let repo = db.getRepository(Recipe);
        if (id) {
            let recipe = await repo.findOne(id);
            if (recipe) {
                recipe = await repo.remove(recipe);
                res.json(recipe);
            } else {
                res.status(404).send("Recipe id non trovato nel db");
            }
        } else {
            res.status(400).send("Recipe id mancante");
        }
    } catch (exc) {
        res.status(500).send("Errore generico in DEL recipe");
    }
});

export default {router, init };
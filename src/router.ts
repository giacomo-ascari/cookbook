// IMPORTS
import log from "./utils/log";
import delay from './utils/delay';
import uuid from "./utils/uuid";

import express from "express";
// helmet, morgan, compress

import session from 'express-session';
import Keycloak from 'keycloak-connect';

import "reflect-metadata";
import * as db from "typeorm";

import Recipe from "./entity/recipe";

// ROUTING STUFF
let router: express.Router = express.Router();
router.use(express.json())
router.use(express.urlencoded({ extended: false }))

// SESSION + KEYCLOAK
let memoryStore = new session.MemoryStore();
let keycloak = new Keycloak({store: memoryStore});

router.use(session({
    secret: process.env.STORE_SECRET as unknown as string,
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

router.use(keycloak.middleware({ logout: '/logoff' } ));

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
    log("worker", info);
    next();
});

// BASE URL
/*router.get("", async (req: express.Request, res: express.Response) => {
    res.status(200).send('Benvenuti al Ricettario')
});*/

// TEST FUNCTION
router.get("/test", async (req: express.Request, res: express.Response) => {
    await delay(500);
    res.status(200).send('Test Ok')
});

// CRUD
router.post("/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
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

router.get("/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
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

router.put("/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
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

router.delete("/recipe", keycloak.protect(), async (req: express.Request, res: express.Response) => {
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
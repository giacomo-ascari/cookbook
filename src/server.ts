// IMPORTS
import express from "express";
import cors from 'cors';
import router, { init } from './router';
import cluster from "cluster";
import log from "./utils/log";
import http from 'http';
import * as dotenv from 'dotenv';

// VARIABLES
const app: express.Application = express();

async function main() {
    
    // CLUSTER GENERATION AND MANAGEMENT
    if (cluster.isMaster) {
    
        // IF THIS PROCESS IS MASTER...
        dotenv.config();
        
        // SOME DATA TO CALC 'N SHOW
        let date: Date = new Date();
        let workers_count: number = process.env.WORKERS as unknown as number;
        log("master", `time: ${date}`, "s");
        log("master", `pid: ${process.pid}`, "s");
        log("master", `worker count: ${workers_count}`, "s");
        log("master", `port: ${process.env.PORT}`, "s");
    
        // EVENT HANDLING OF THE WORKER
        cluster.on('fork', (worker) => {
            log("master",`worker pid ${worker.process.pid} forked`, "s");
        });
        cluster.on('exit', (worker) => {
            log("master",`worker pid ${worker.process.pid} exited`, "s");
            cluster.fork();
        });
    
        // WORKER FORKING
        for (var i = 0; i < workers_count; i++) {
            cluster.fork();
        }

        log("master",`listening on http://localhost:${process.env.PORT}${process.env.BASE_URL}`, "s");
    
    } else if (cluster.isWorker) {
    
        // IF THIS PROCESS IS A WORKER...
        
        // UNHANDLED EXCEPTIONS END UP HERE
        process.on('uncaughtException', (code: any, signal: any) => {
            log("WORKER",`worker uncaughtException\n\tcode:(${code})\n\tsignal:(${signal})`, "e");
            process.exit()
        })

        // CREATE AN APP, WHICH HANDLES REQ/RES WITH AN EXPRESS ROUTER
        let init_result = await router.init();
        if (init_result)
            process.exit()
        
        let base_url = process.env.BASE_URL as unknown as string;
        /*app.use(cors({
            origin: `http://localhost:${process.env.PORT}`,
            credentials: true
        }))*/
        app.use(cors());
        app.use(base_url, express.static("public"));
        app.use(base_url + "/api", router.router as express.Router);

        let server: http.Server = http.createServer(app)
        server.listen(process.env.PORT || 80)
    }
}

// ENTRY POINT
main();


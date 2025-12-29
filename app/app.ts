import { Server as HTTPServer } from 'http';
import express from 'express';
import { Api } from './api/api';
import { ApiV1 } from './api/api-v1';
import { Env } from './utils/env';
import { logger } from './utils/logger';
import { OpenApiService } from './services/open-api-service';
import { Database } from './database';

export class App {

    static async run(): Promise<void> {
        try {
            const app = new App();
            const server = await app.start();
            if (!server)
                throw new Error('Unable to start the server, please check the server log');
        } catch (error: unknown) {
            logger.error(error);
        }
    }

    private async start(): Promise<HTTPServer> {
        await this.setup();
        const app = express();
        app.set('trust proxy', true);

        const server = new HTTPServer(app);
        const apiV1: Api = new ApiV1();
        apiV1.addRoutes(app);

        const port = Number(Env.API_PORT || 8080);
        server.listen(port, () => logger.info(`API server is running on ${Env.ENV_NAME} at ${port}`));
        return server;
    }

    private async setup(): Promise<void> {
        // Env.loadFromEnv();
        this.initializeServices();
        await Database.initialize();
    }

    private initializeServices(): void {
        OpenApiService.initialize();
    }

}

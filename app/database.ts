import { DataSource, DataSourceOptions, EntityManager } from "typeorm";
import { MODELS } from "./models";
import { Env } from "./utils/env";
import { logger } from "./utils/logger";

/**
 * Database utility class for initializing and managing the TypeORM connection.
 */
export class Database {
    /**
     * The current TypeORM DataSource connection (singleton).
     */
    private static connection: DataSource | null = null;

    /**
     * Initializes the database connection using TypeORM and environment variables.
     * @returns Promise that resolves when the connection is established
     */
    public static initialize(): Promise<void> {
        this.connection = new DataSource(this.getConfig());
        return new Promise((resolve, reject) => {
            this.connection?.initialize()
                .then(async () => {
                    logger.info("Connected to the database successfully");
                    resolve();
                })
                .catch((err: any) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        reject(new Error(typeof err === 'string' ? err : JSON.stringify(err)));
                    }
                });
        });
    }

    /**
     * Returns the TypeORM EntityManager for database operations.
     * @returns EntityManager instance
     * @throws Error if the database is not initialized
     */
    public static get manager(): EntityManager {
        if (this.connection == null)
            throw new Error("Database is not initialized");
        return this.connection.createEntityManager();
    }

    /**
     * Returns the TypeORM DataSourceOptions configuration for the connection.
     * @returns DataSourceOptions object
     */
    private static getConfig(): DataSourceOptions {
        const config: DataSourceOptions = {
            type: "mysql",
            host: Env.DB_HOST,
            port: +Env.DB_PORT,
            username: Env.DB_USERNAME,
            password: Env.DB_PASSWORD,
            database: Env.DB_NAME,
            migrationsRun: false,
            synchronize: Env.DB_SYNC == 'true',
            logger: "simple-console",
            logging: false,
            charset: "utf8mb4",
            timezone: "+05:30",
            entities: MODELS
        };
        return config;
    }

    /**
     * Closes the database connection (used in testing).
     * @returns Promise that resolves when the connection is closed
     */
    public static async closeDBConnection(): Promise<void> {
        await this.connection?.destroy();
    }
}

/**
 * Type representing sort order for queries ('ASC' or 'DESC').
 */
export type SortOrder = 'ASC' | 'DESC';

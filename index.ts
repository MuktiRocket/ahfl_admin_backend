import dotenv from 'dotenv';
import "reflect-metadata";
import { App } from './app/app';

dotenv.config();

App.run();
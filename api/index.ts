import { app, serverReady } from "../server";

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    await serverReady;
    initialized = true;
  }
  return app(req, res);
}

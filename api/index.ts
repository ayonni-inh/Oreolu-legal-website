import { app, serverReady } from "../server";

// Tell Vercel not to parse the body — Express handles it via express.json() and multer
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    await serverReady;
    initialized = true;
  }
  return app(req, res);
}

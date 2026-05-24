import dotenv from "dotenv";

dotenv.config();

export const API_URL_LOCAL =
  process.env.API_URL_LOCAL || "http://localhost:5000";

export const API_URL_PRODUCTION =
  process.env.API_URL_PRODUCTION || "https://healzy-adminpanel-backend.vercel.app";

/** Switch API target: `local` or `production` */
export const API_ENV = (process.env.API_ENV || "local").toLowerCase();

export const getActiveApiUrl = () =>
  API_ENV === "production" ? API_URL_PRODUCTION : API_URL_LOCAL;

export const getApiUrls = () => ({
  local: API_URL_LOCAL,
  production: API_URL_PRODUCTION,
  active: getActiveApiUrl(),
  env: API_ENV,
});

export default getApiUrls;

export interface Config {
  port: number;

  database: {
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
  };
  openai: {
    API_KEY: string;
    organization: string;
  };
  youtube: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
}

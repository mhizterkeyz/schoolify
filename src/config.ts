interface IConfiguration {
  env: string;
  isTest: boolean;
  port: number;
  database: {
    url: string;
  };
}

export const configuration = (): IConfiguration => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  env: process.env.NODE_ENV || 'development',
  isTest: process.env.NODE_ENV === 'test',
  port: +process.env.PORT || 2001,
});

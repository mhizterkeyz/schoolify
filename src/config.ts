interface IConfiguration {
  env: string;
  isTest: boolean;
  port: number;
}

export const configuration = (): IConfiguration => ({
  env: process.env.NODE_ENV || 'development',
  isTest: process.env.NODE_ENV === 'test',
  port: +process.env.PORT || 2001,
});

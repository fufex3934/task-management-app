export class ConfigService {
  private config: Record<string, string> = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
  };

  get(key: string): string {
    return this.config[key];
  }
}

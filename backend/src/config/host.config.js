export const hostConfig = {
  development: {
    host: 'localhost',
    port: process.env.PORT || 3000,
    protocol: 'http',
    get url() {
      return `${this.protocol}://${this.host}:${this.port}`;
    }
  },
  production: {
    host: process.env.VERCEL_URL || 'your-production-url.vercel.app',
    port: process.env.PORT || 443,
    protocol: 'https',
    get url() {
      return `${this.protocol}://${this.host}`;
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
export const currentHost = hostConfig[environment];

export default {
  hostConfig,
  currentHost
};

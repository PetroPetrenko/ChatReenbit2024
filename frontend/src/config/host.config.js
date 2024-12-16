const hostConfig = {
  development: {
    frontend: {
      host: 'localhost',
      port: 5173,
      protocol: 'http',
      get url() {
        return `${this.protocol}://${this.host}:${this.port}`;
      }
    },
    backend: {
      host: 'localhost',
      port: 3333,
      protocol: 'http',
      get url() {
        return `${this.protocol}://${this.host}:${this.port}`;
      }
    }
  },
  production: {
    frontend: {
      host: import.meta.env.VITE_FRONTEND_URL || 'your-frontend-url.vercel.app',
      protocol: 'https',
      get url() {
        return `${this.protocol}://${this.host}`;
      }
    },
    backend: {
      host: import.meta.env.VITE_API_URL || 'your-backend-url.vercel.app',
      protocol: 'https',
      get url() {
        return `${this.protocol}://${this.host}`;
      }
    }
  }
};

const environment = import.meta.env.MODE || 'development';
export const currentHost = hostConfig[environment];

export const apiUrl = currentHost.backend.url;
export const socketUrl = currentHost.backend.url;
export const frontendUrl = currentHost.frontend.url;

export default {
  hostConfig,
  currentHost,
  apiUrl,
  socketUrl,
  frontendUrl
};

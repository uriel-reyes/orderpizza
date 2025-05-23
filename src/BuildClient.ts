import fetch from 'node-fetch';
import { 
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions 
} from '@commercetools/ts-client';
import {
  createApiBuilderFromCtpClient
} from '@commercetools/platform-sdk';
import 'dotenv/config';

// Access environment variables with non-null assertion operator
const projectKey = process.env.CTP_PROJECT_KEY!;
const clientId = process.env.CTP_CLIENT_ID!;
const clientSecret = process.env.CTP_CLIENT_SECRET!;
const authUrl = process.env.CTP_AUTH_URL!;
const apiUrl = process.env.CTP_API_URL!;
const scopes = process.env.CTP_SCOPES ? process.env.CTP_SCOPES.split(',') : [];

// Print the configuration for debugging
console.log('Using configuration:');
console.log(`- Project Key: ${projectKey}`);
console.log(`- Auth URL: ${authUrl}`);
console.log(`- API URL: ${apiUrl}`);

// Configure authMiddlewareOptions
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: authUrl,
  projectKey: projectKey,
  credentials: {
    clientId: clientId,
    clientSecret: clientSecret,
  },
  scopes,
  httpClient: fetch,
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: apiUrl,
  httpClient: fetch,
};

// Create the commercetools client
const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .withLoggerMiddleware()
  .build();

// Create apiRoot from the commercetools client and include your project key
const apiRoot = createApiBuilderFromCtpClient(ctpClient)
  .withProjectKey({ projectKey });

// Export apiRoot as default for direct imports
export default apiRoot;

// Also export the client if needed elsewhere
export { ctpClient };
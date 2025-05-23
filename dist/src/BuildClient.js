"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctpClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const ts_client_1 = require("@commercetools/ts-client");
const platform_sdk_1 = require("@commercetools/platform-sdk");
require("dotenv/config");
// Access environment variables with non-null assertion operator
const projectKey = process.env.CTP_PROJECT_KEY;
const clientId = process.env.CTP_CLIENT_ID;
const clientSecret = process.env.CTP_CLIENT_SECRET;
const authUrl = process.env.CTP_AUTH_URL;
const apiUrl = process.env.CTP_API_URL;
const scopes = process.env.CTP_SCOPES ? process.env.CTP_SCOPES.split(',') : [];
// Print the configuration for debugging
console.log('Using configuration:');
console.log(`- Project Key: ${projectKey}`);
console.log(`- Auth URL: ${authUrl}`);
console.log(`- API URL: ${apiUrl}`);
// Configure authMiddlewareOptions
const authMiddlewareOptions = {
    host: authUrl,
    projectKey: projectKey,
    credentials: {
        clientId: clientId,
        clientSecret: clientSecret,
    },
    scopes,
    httpClient: node_fetch_1.default,
};
// Configure httpMiddlewareOptions
const httpMiddlewareOptions = {
    host: apiUrl,
    httpClient: node_fetch_1.default,
};
// Create the commercetools client
const ctpClient = new ts_client_1.ClientBuilder()
    .withProjectKey(projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .withLoggerMiddleware()
    .build();
exports.ctpClient = ctpClient;
// Create apiRoot from the commercetools client and include your project key
const apiRoot = (0, platform_sdk_1.createApiBuilderFromCtpClient)(ctpClient)
    .withProjectKey({ projectKey });
// Export apiRoot as default for direct imports
exports.default = apiRoot;

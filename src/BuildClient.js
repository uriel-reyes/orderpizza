"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctpClient = void 0;
var node_fetch_1 = require("node-fetch");
var ts_client_1 = require("@commercetools/ts-client");
var platform_sdk_1 = require("@commercetools/platform-sdk");
require("dotenv/config");
// Access environment variables with non-null assertion operator
var projectKey = process.env.CTP_PROJECT_KEY;
var clientId = process.env.CTP_CLIENT_ID;
var clientSecret = process.env.CTP_CLIENT_SECRET;
var authUrl = process.env.CTP_AUTH_URL;
var apiUrl = process.env.CTP_API_URL;
var scopes = process.env.CTP_SCOPES ? process.env.CTP_SCOPES.split(',') : [];
// Configure authMiddlewareOptions
var authMiddlewareOptions = {
    host: authUrl,
    projectKey: projectKey,
    credentials: {
        clientId: clientId,
        clientSecret: clientSecret,
    },
    scopes: scopes,
    httpClient: node_fetch_1.default,
};
// Configure httpMiddlewareOptions
var httpMiddlewareOptions = {
    host: apiUrl,
    httpClient: node_fetch_1.default,
};
// Create the commercetools client
var ctpClient = new ts_client_1.ClientBuilder()
    .withProjectKey(projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .withLoggerMiddleware()
    .build();
exports.ctpClient = ctpClient;
// Create apiRoot from the commercetools client and include your project key
var apiRoot = (0, platform_sdk_1.createApiBuilderFromCtpClient)(ctpClient)
    .withProjectKey({ projectKey: projectKey });
// Export apiRoot as default for direct imports
exports.default = apiRoot;

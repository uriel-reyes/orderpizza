"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
const getObject = () => {
    return BuildClient_1.default
        .products()
        .get({
        queryArgs: {
            limit: 500
        }
    })
        .execute()
        .then(response => response.body.results);
};
const getObject2 = () => {
    return BuildClient_1.default
        .customers()
        .get({
        queryArgs: {
        // where: `customerGroup(id="975a3381-3ee8-40c6-b0e5-a64cea868dab")`
        // where:'externalId="123"'
        }
    })
        .execute();
};

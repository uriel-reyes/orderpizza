"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BuildClient_1 = __importDefault(require("../src/BuildClient"));
const createCustomer = () => {
    return BuildClient_1.default
        .customers()
        .post({
        body: {
            email: "Erin@test.com",
            password: "123",
            isEmailVerified: true,
            firstName: "Erin",
            lastName: "Rodgers"
        }
    })
        .execute();
};
exports.default = createCustomer;

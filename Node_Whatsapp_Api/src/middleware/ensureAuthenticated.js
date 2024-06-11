"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
function ensureAuthenticated(request, response, next) {
    const authToken = request.headers.authorization;
    if (!authToken) {
        response.status(401).json({ errorCode: "token.invalid" });
    }
    else {
        const [, token] = authToken === null || authToken === void 0 ? void 0 : authToken.split(" ");
        try {
            const { sub } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            request.user_id = sub;
            return next();
        }
        catch (error) {
            response.status(401).json({ errorCode: "token.expired" });
        }
    }
}
exports.ensureAuthenticated = ensureAuthenticated;

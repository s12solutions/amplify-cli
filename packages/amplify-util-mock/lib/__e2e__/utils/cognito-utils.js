"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const uuid_1 = require("uuid");
function signUpAddToGroupAndGetJwtToken(userPool, username, email, groups = [], tokenType = 'id') {
    const token = {
        sub: uuid_1.v4(),
        aud: '75pk49boud2olipfda0ke3snic',
        'cognito:groups': groups,
        event_id: uuid_1.v4(),
        token_use: tokenType,
        auth_time: Math.floor(Date.now() / 1000),
        iss: `https://cognito-idp.us-west-2.amazonaws.com/us-west-2_${userPool}`,
        'cognito:username': username,
        exp: Math.floor(Date.now() / 1000) + 10000,
        iat: Math.floor(Date.now() / 1000),
        email: 'user1@test.com',
    };
    return generateToken(token);
}
exports.signUpAddToGroupAndGetJwtToken = signUpAddToGroupAndGetJwtToken;
function generateToken(decodedToken) {
    try {
        if (typeof decodedToken === 'string') {
            decodedToken = JSON.parse(decodedToken);
        }
        const token = jsonwebtoken_1.sign(decodedToken, 'open-secrete');
        jsonwebtoken_1.verify(token, 'open-secrete');
        return token;
    }
    catch (e) {
        const err = new Error('Error when generating OIDC token: ' + e.message);
        throw err;
    }
}
//# sourceMappingURL=cognito-utils.js.map
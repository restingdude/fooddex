"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdmin = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.setAdmin = (0, https_1.onCall)(async (request) => {
    console.log('SetAdmin function called with data:', request.data);
    console.log('Auth context:', request.auth);
    // Ensure auth exists
    if (!request.auth) {
        console.log('No auth context found');
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    // Check if the caller is allowed to make admin changes
    if (request.auth.uid !== '230aeyo6aIXKTmeBdPxkiEqEY513') {
        console.log('User not authorized:', request.auth.uid);
        throw new https_1.HttpsError('permission-denied', 'Only authorized users can set admin status');
    }
    const { targetUserId, isAdmin } = request.data;
    try {
        console.log(`Setting admin status for user ${targetUserId} to ${isAdmin}`);
        // Set admin claim
        await admin.auth().setCustomUserClaims(targetUserId, { admin: isAdmin });
        console.log('Custom claims set successfully');
        // Force token refresh
        await admin.auth().revokeRefreshTokens(targetUserId);
        console.log('Tokens revoked successfully');
        return {
            success: true,
            message: `Admin status for user ${targetUserId} set to ${isAdmin}`,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Error in setAdmin function:', error);
        throw new https_1.HttpsError('internal', 'Error setting admin status: ' + error.message);
    }
});
//# sourceMappingURL=admin.js.map
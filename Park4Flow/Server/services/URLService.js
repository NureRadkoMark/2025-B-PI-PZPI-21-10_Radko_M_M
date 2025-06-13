/**
 * Extracts the PayPal order ID from the approval URL.
 * @param {string} approvalUrl - The PayPal approval URL.
 * @returns {string} - The extracted order ID.
 * @throws {Error} - Throws an error if the URL is invalid or the token is missing.
 */
export function extractOrderId(approvalUrl) {
    try {
        if (!approvalUrl || typeof approvalUrl !== 'string') {
            throw new Error('The approval URL must be a non-empty string.');
        }

        const url = new URL(approvalUrl);
        const orderId = url.searchParams.get('token');

        if (!orderId) {
            throw new Error('The token parameter (order ID) is missing from the approval URL.');
        }
        console.log(orderId)
        return orderId;
    } catch (err) {
        throw new Error(`Failed to extract order ID: ${err.message}`);
    }
}
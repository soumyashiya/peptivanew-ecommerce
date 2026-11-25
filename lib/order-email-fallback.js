// Fallback for builds where the VPS-only /var/www/shared-email module is not on
// disk (Vercel, fresh clones). next.config.mjs swaps the route's import to this
// file only when the real module is missing, so the VPS build is unchanged.
// No email is sent from these environments.

export async function sendOrderConfirmationEmail({ domain, order }) {
  console.warn("[order-email] shared-email module not available in this deployment; confirmation email skipped", {
    domain,
    orderKeys: order ? Object.keys(order) : [],
  });
  return { success: true, skipped: true };
}

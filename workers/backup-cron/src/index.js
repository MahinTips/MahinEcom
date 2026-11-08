export default {
    async scheduled(event, _env, _ctx) {
        console.log(`[ShopNest Backup Cron] Scheduled execution trigger at: ${new Date(event.scheduledTime).toISOString()}`);
    },
    async fetch() {
        return new Response('ShopNest Backup Worker (Cron Triggered)', { status: 200 });
    },
};
//# sourceMappingURL=index.js.map
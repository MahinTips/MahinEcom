export default {
    async fetch(request, _env) {
        const url = new URL(request.url);
        if (url.pathname === '/api/v1/health') {
            return new Response(JSON.stringify({ status: 'ok', service: 'shopnest-api' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response('ShopNest API Gateway', { status: 200 });
    },
};
//# sourceMappingURL=index.js.map
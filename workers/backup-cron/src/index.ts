export interface Env {
  GOOGLE_DRIVE_FOLDER_ROOT: string;
}

export default {
  async scheduled(event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(`[ShopNest Backup Cron] Scheduled execution trigger at: ${new Date(event.scheduledTime).toISOString()}`);
  },
  async fetch(): Promise<Response> {
    return new Response('ShopNest Backup Worker (Cron Triggered)', { status: 200 });
  },
};


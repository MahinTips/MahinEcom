import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopNest Multi-Tenant E-Commerce Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, sans-serif;
      background: #0F172A;
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .container {
      max-width: 48rem;
      width: 100%;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .pulse {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #FFFFFF;
    }
    p.lead {
      font-size: 1.1rem;
      color: #94A3B8;
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 1.25rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: #F59E0B;
      transform: translateY(-2px);
    }
    .card h3 {
      font-size: 1.1rem;
      color: #F59E0B;
      margin-bottom: 0.5rem;
    }
    .card p {
      font-size: 0.875rem;
      color: #94A3B8;
      line-height: 1.5;
    }
    .info-box {
      background: #0B1120;
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.85rem;
      color: #38BDF8;
      overflow-x: auto;
      border: 1px solid #1E293B;
    }
    .footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.85rem;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span class="pulse"></span>
      ShopNest Cloud Platform • Live on Cloudflare
    </div>
    <h1>ShopNest মাল্টি-টেনান্ট প্ল্যাটফর্ম</h1>
    <p class="lead">
      এন্টারপ্রাইজ গ্রেড মাল্টি-টেনান্ট ই-কমার্স প্ল্যাটফর্ম। Cloudflare Edge Network এবং Firebase Spark/Blaze ডেটাবেজে সম্পূর্ণ সক্রিয়।
    </p>

    <div class="grid">
      <div class="card">
        <h3>👑 Super Admin</h3>
        <p>প্ল্যাটফর্ম ড্যাশবোর্ড, টেন্যান্ট অনবোর্ডিং, কোটা ট্র্যাকার ও বিলিং ম্যানেজমেন্ট।</p>
      </div>
      <div class="card">
        <h3>🏢 Tenant Admin</h3>
        <p>মার্চেন্টদের ক্যাটালগ, আনলিমিটেড ভ্যারিয়েন্ট, অর্ডার ও ইনভেন্টরি কন্ট্রোল।</p>
      </div>
      <div class="card">
        <h3>🛍️ Edge Storefront</h3>
        <p>Astro SSR + React Islands চালিত সুপার ফাস্ট এসইও ফ্রেন্ডলি স্টোর।</p>
      </div>
    </div>

    <div class="info-box">
      [Edge Status]: Active | Project: mahinecommerce | Worker: mahinecom.mahintips.workers.dev
    </div>

    <div class="footer">
      © 2026 ShopNest • Built with Cloudflare Pages, Workers & Firebase
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
console.log('✅ Generated Cloudflare Pages dist/index.html successfully');

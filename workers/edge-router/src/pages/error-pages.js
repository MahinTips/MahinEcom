/**
 * Edge Router Fallback HTML Pages
 * Rendered at the edge when tenant is not found or suspended
 */
export function renderTenantNotFoundHtml(hostname) {
    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>দোকানটি খুঁজে পাওয়া যায়নি | Store Not Found — ShopNest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.25);
      backdrop-filter: blur(12px);
      border-radius: 1.25rem;
      max-width: 32rem;
      width: 100%;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      line-height: 1;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
    }
    p {
      color: #94A3B8;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .host-badge {
      font-family: monospace;
      background: #0B1120;
      color: #38BDF8;
      padding: 0.25rem 0.6rem;
      border-radius: 0.375rem;
      font-size: 0.9rem;
    }
    .btn {
      display: inline-block;
      background: #F59E0B;
      color: #0F172A;
      font-weight: 700;
      text-decoration: none;
      padding: 0.75rem 1.75rem;
      border-radius: 0.5rem;
      transition: background 0.2s ease;
    }
    .btn:hover {
      background: #D97706;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.8rem;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">ত্রুটি ৪০৪ • Error 404</div>
    <div class="icon">🏪❓</div>
    <h1>দোকানটি খুঁজে পাওয়া যায়নি</h1>
    <p>
      দুঃখিত, <span class="host-badge">${hostname}</span> ঠিকানায় কোনো সক্রিয় অনলাইন শপ নিবন্ধিত নেই বা এর ডোমেন কনফিগারেশন এখনও সম্পন্ন হয়নি।
    </p>
    <p style="font-size: 0.875rem; color: #64748B;">
      No active store found for this address. If you are the store owner, please verify your custom domain settings in the ShopNest Super Admin dashboard.
    </p>
    <a href="https://shopnest.com" class="btn">ShopNest হোমপেজে যান</a>
    <div class="footer">
      Powered by ShopNest Multi-Tenant Cloud • Edge Routing Engine
    </div>
  </div>
</body>
</html>`;
}
export function renderTenantSuspendedHtml(hostname, tenantName) {
    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>দোকানটি সাময়িকভাবে স্থগিত | Store Suspended — ShopNest</title>
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
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #1E293B;
      border: 1px solid #EF4444;
      border-radius: 1.25rem;
      max-width: 32rem;
      width: 100%;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 20px 40px rgba(239, 68, 68, 0.15);
    }
    .icon { font-size: 3.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.6rem; color: #FCA5A5; margin-bottom: 0.75rem; }
    p { color: #94A3B8; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>দোকানটি সাময়িকভাবে স্থগিত রয়েছে</h1>
    <p>
      ${tenantName ? `<strong>${tenantName}</strong> (${hostname})` : hostname} এর অনলাইন সেবা এই মুহূর্তে সাময়িকভাবে বন্ধ রয়েছে। বিস্তারিত তথ্যের জন্য দোকান কর্তৃপক্ষের সাথে যোগাযোগ করুন।
    </p>
    <p style="font-size: 0.85rem; color: #64748B;">
      This store has been temporarily suspended. If you are the owner, please check your subscription status or contact support.
    </p>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=error-pages.js.map
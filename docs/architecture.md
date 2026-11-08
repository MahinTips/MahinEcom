# ShopNest Multi-Tenant E-Commerce SaaS Architecture & Data Model

## ১. সম্পূর্ণ সিস্টেম আর্কিটেকচার (Complete Architecture Diagram)

```mermaid
flowchart TD
    subgraph ClientLayer["ক্লায়েন্ট ও ডোমেইন লেয়ার (Client Access)"]
        UserBrowser["🌐 ক্রেতা (Storefront Customer)\ncustomdomain.com / slug.shopnest.com"]
        TenantAdminUser["🏢 মার্চেন্ট / টেন্যান্ট অ্যাডমিন\nadmin.shopnest.com"]
        SuperAdminUser["🛡️ সুপার অ্যাডমিন\nsuper.shopnest.com"]
    end

    subgraph CloudflareEdge["Cloudflare Edge Network"]
        CF_WAF["Cloudflare WAF / Turnstile DDoS Protection"]
        EdgeRouter["⚡ Edge Router Worker\n(Host Header Inspection)"]
        KV_Domains[("🗄️ Cloudflare KV\nDomain -> Tenant Config")]
        EdgeCache[("⚡ Cloudflare Cache API\nEdge Cache (Products, Categories, Theme)")]
    end

    subgraph HostingApplications["Cloudflare Pages / Workers Apps"]
        StorefrontAstro["🛍️ Storefront (Astro SSR + React Islands)\nEdge-Rendered with Cloudflare Adapter"]
        TenantAdminSPA["📊 Tenant Admin (React + Vite PWA)"]
        SuperAdminSPA["👑 Super Admin (React + Vite PWA)\nDark + Amber Theme"]
        APIWorker["⚙️ Cloudflare Worker API\n(Payments, Courier Webhooks, Auth claims)"]
        BackupWorker["⏰ Backup Cron Trigger Worker\n(Runs every 15 mins)"]
    end

    subgraph AbstractionLayer["ShopNest Core Abstraction"]
        DataAdapter["🔌 DataAdapter Layer (IDataAdapter)\n- Quota Tracking (70% Warning / 90% Critical)\n- Cursor Pagination\n- count() Aggregation\n- Spark to Blaze Flag Switch"]
    end

    subgraph DatabaseLayer["Database & Storage (Spark / Blaze Ready)"]
        subgraph PlatformMaster["Platform Master Project (Spark Plan)"]
            FirestorePlatform[("🔥 Firestore Platform Registry\n/tenants, /domains, /saasPlans, /auditLogs")]
            FirebaseAuth["🔑 Firebase Authentication\n(Custom Claims: tenantId, role)"]
        end

        subgraph SharedTenantSpace["Shared Project Mode"]
            FirestoreShared[("🔥 Shared Firestore\n/tenants/{tenantId}/...")]
        end

        subgraph DedicatedTenantSpace["Dedicated Project Mode"]
            FirestoreDedicated[("🔥 Client's Own Firebase Project\nDirect Isolated Firestore")]
        end

        CloudinaryMedia["☁️ Cloudinary Media Cloud\n/tenants/{tenantId}/products/..."]
        GoogleDrive["💾 Google Drive API\nResumable Backup /Backups/{tenantName}/..."]
    end

    %% Flow connections
    UserBrowser --> CF_WAF --> EdgeRouter
    TenantAdminUser --> CF_WAF --> EdgeRouter
    SuperAdminUser --> CF_WAF --> EdgeRouter

    EdgeRouter --> KV_Domains
    EdgeRouter --> EdgeCache
    EdgeRouter -- "Host: customdomain.com" --> StorefrontAstro
    EdgeRouter -- "Host: admin.shopnest.com" --> TenantAdminSPA
    EdgeRouter -- "Host: super.shopnest.com" --> SuperAdminSPA

    StorefrontAstro --> DataAdapter
    TenantAdminSPA --> DataAdapter
    SuperAdminSPA --> DataAdapter
    APIWorker --> DataAdapter
    BackupWorker --> DataAdapter

    DataAdapter --> FirestorePlatform
    DataAdapter --> FirestoreShared
    DataAdapter --> FirestoreDedicated

    APIWorker --> CloudinaryMedia
    BackupWorker --> GoogleDrive
```

---

## ২. Firestore ডাটা মডেল (Firestore Data Model)

```mermaid
erDiagram
    TENANTS ||--o{ DOMAINS : "maps to"
    TENANTS ||--|| BACKUP_CONFIGS : "has"
    TENANTS ||--o{ PRODUCTS : "contains"
    TENANTS ||--o{ CATEGORIES : "contains"
    TENANTS ||--o{ ORDERS : "receives"
    TENANTS ||--o{ CUSTOMERS : "tracks"
    TENANTS ||--o{ INVENTORY_LOGS : "logs"
    TENANTS ||--o{ STORE_SETTINGS : "configures"
    TENANTS ||--o{ USERS : "employs"
    SAAS_PLANS ||--o{ TENANTS : "subscribed by"

    TENANTS {
        string id PK "tenantId (e.g. artisan-bd)"
        string name "Business Name"
        string slug "Subdomain Slug"
        string firebaseMode "shared | dedicated"
        string planMode "spark | blaze"
        string saasPlanId FK "free | basic | pro | enterprise"
        string status "active | suspended | trial"
        string ownerEmail "Owner Email"
        json quotaMetrics "Daily Reads/Writes Tracking"
        json features "Flags: customDomain, bulkExport"
        timestamp createdAt
    }

    DOMAINS {
        string hostname PK "artisan.com.bd or slug.shopnest.com"
        string tenantId FK "Reference to Tenant"
        boolean isCustom "true for custom domains"
        string sslStatus "active | pending_validation | failed"
        string dnsCnameTarget "custom.shopnest.com"
    }

    PRODUCTS {
        string id PK "prod-001"
        string tenantId FK
        string name "Handmade Clay Mug"
        string nameBn "হস্তনির্মিত মাটির মগ"
        string slug "handmade-clay-mug"
        string sku "MUG-001"
        number price "350"
        number compareAtPrice "450"
        number stock "25"
        boolean trackStock "true"
        string status "published | draft"
        array categoryIds
        array variants "Size, Color combinations"
        array images "Cloudinary URLs + public_ids + alt"
        array searchTokens "Spark prefix-search friendly tokens"
    }

    ORDERS {
        string id PK "ord-001"
        string tenantId FK
        string orderNumber "ORD-2026-0001"
        json customer "Name, Phone, Email"
        json shippingAddress "Address, City, District"
        array items "Products, Quantities, Prices"
        number total "Total Amount in BDT"
        string status "pending | processing | shipped | delivered"
        string paymentMethod "cod | bkash | nagad | sslcommerz"
        string paymentStatus "unpaid | paid"
        json courierDetails "Steadfast / Pathao tracking"
        timestamp createdAt
    }

    STORE_SETTINGS {
        string id PK "general | theme | payment | shipping | seo"
        json general "Store name, Logo, Phone, Currency"
        json theme "Primary color, Accent, Font (Hind Siliguri)"
        json payment "COD, bKash Merchant Number, etc."
        json shipping "Inside/Outside Dhaka rates"
        json seo "Meta Title, Description, OG Image"
    }
```

---

## ৩. Spark প্ল্যান সুরক্ষা ও কোটা মনিটরিং কৌশল (Spark Quota Guard)

1. **Zero Firebase Cloud Functions**: সমস্ত সার্ভার লজিক (অর্ডার তৈরি, পেমেন্ট ভেরিফিকেশন, ওয়েবহুক, ব্যাকআপ ক্রন) Cloudflare Workers-এ নির্বাহ করা হয়।
2. **Edge Caching via Cloudflare Cache API & KV**:
   - ক্যাটাগরি, পণ্যের বিবরণ ও স্টোর সেটিংস Cloudflare Edge-এ ক্যাশ করা হয়।
   - প্রতিবার স্টোরফ্রন্ট ভিজিটে সরাসরি Firestore Read হয় না।
   - টেন্যান্ট অ্যাডমিন থেকে কোনো পণ্য বা সেটিং পরিবর্তন হলে `Cloudflare Purge API` দিয়ে নির্দিষ্ট ক্যাশ ইনভ্যালিডেট করা হয়।
3. **Cursor-Based Pagination**:
   - `offset` এর বদলে `startAfter` (cursor token) ব্যবহার করা হয়, যাতে Spark-এর অপ্রয়োজনীয় স্ক্যান রিড না হয়।
4. **Aggregation via Native `count()`**:
   - Firestore `count()` অ্যাগ্রিগেশন কুয়েরি ব্যবহার করা হয় যা প্রতি ১,০০০ ডকুমেন্টের জন্য মাত্র ১টি Read খরচ করে।
5. **Real-time Quota Alert System**:
   - `QuotaTracker` প্রতিটি অপারেশন রিয়েল-টাইমে পর্যবেক্ষণ করে।
   - দৈনন্দিন Firestore Read সীমা (৫০,০০০) এর ৭০% এ সতর্কতা এবং ৯০% এ ক্রিটিক্যাল অ্যালার্ট জারি করে এবং টেন্যান্টকে Blaze-এ আপগ্রেড করার পরামর্শ দেয়।
6. **Blaze Migration Flag**:
   - প্রতিটি টেন্যান্ট ডকুমেন্টে `planMode: 'spark' | 'blaze'` ফ্ল্যাগ থাকে।
   - Blaze চালু হলে ব্যাকআপ এবং এক্সটেনশন স্বয়ংক্রিয়ভাবে অ্যাক্টিভেট হয়, ব্যবসায়িক কোনো কোড পরিবর্তন করতে হয় না।


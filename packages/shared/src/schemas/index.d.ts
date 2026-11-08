import { z } from 'zod';
export declare const FirebaseWebConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    authDomain: z.ZodString;
    projectId: z.ZodString;
    storageBucket: z.ZodOptional<z.ZodString>;
    messagingSenderId: z.ZodOptional<z.ZodString>;
    appId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string | undefined;
    messagingSenderId?: string | undefined;
    appId?: string | undefined;
}, {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string | undefined;
    messagingSenderId?: string | undefined;
    appId?: string | undefined;
}>;
export declare const TenantCreateSchema: z.ZodObject<{
    name: z.ZodString;
    nameBn: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
    ownerEmail: z.ZodString;
    ownerPhone: z.ZodOptional<z.ZodString>;
    firebaseMode: z.ZodEnum<["shared", "dedicated"]>;
    planMode: z.ZodDefault<z.ZodEnum<["spark", "blaze"]>>;
    saasPlanId: z.ZodDefault<z.ZodString>;
    dedicatedFirebaseConfig: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodString;
        authDomain: z.ZodString;
        projectId: z.ZodString;
        storageBucket: z.ZodOptional<z.ZodString>;
        messagingSenderId: z.ZodOptional<z.ZodString>;
        appId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket?: string | undefined;
        messagingSenderId?: string | undefined;
        appId?: string | undefined;
    }, {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket?: string | undefined;
        messagingSenderId?: string | undefined;
        appId?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    ownerEmail: string;
    firebaseMode: "shared" | "dedicated";
    planMode: "spark" | "blaze";
    saasPlanId: string;
    nameBn?: string | undefined;
    ownerPhone?: string | undefined;
    dedicatedFirebaseConfig?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket?: string | undefined;
        messagingSenderId?: string | undefined;
        appId?: string | undefined;
    } | undefined;
}, {
    name: string;
    slug: string;
    ownerEmail: string;
    firebaseMode: "shared" | "dedicated";
    nameBn?: string | undefined;
    ownerPhone?: string | undefined;
    planMode?: "spark" | "blaze" | undefined;
    saasPlanId?: string | undefined;
    dedicatedFirebaseConfig?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket?: string | undefined;
        messagingSenderId?: string | undefined;
        appId?: string | undefined;
    } | undefined;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    attributes: z.ZodRecord<z.ZodString, z.ZodString>;
    price: z.ZodNumber;
    compareAtPrice: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodNumber;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    compareAtPrice?: number | undefined;
    image?: string | undefined;
}, {
    name: string;
    id: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    compareAtPrice?: number | undefined;
    image?: string | undefined;
}>;
export declare const ProductImageSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
    publicId: z.ZodString;
    blurDataUrl: z.ZodOptional<z.ZodString>;
    alt: z.ZodString;
    altBn: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
    publicId: string;
    alt: string;
    isPrimary: boolean;
    displayOrder: number;
    blurDataUrl?: string | undefined;
    altBn?: string | undefined;
}, {
    id: string;
    url: string;
    publicId: string;
    alt: string;
    blurDataUrl?: string | undefined;
    altBn?: string | undefined;
    isPrimary?: boolean | undefined;
    displayOrder?: number | undefined;
}>;
export declare const ProductSchema: z.ZodObject<{
    name: z.ZodString;
    nameBn: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
    sku: z.ZodString;
    description: z.ZodString;
    descriptionBn: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    compareAtPrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodNumber;
    trackStock: z.ZodDefault<z.ZodBoolean>;
    lowStockThreshold: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["draft", "published"]>>;
    categoryIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        attributes: z.ZodRecord<z.ZodString, z.ZodString>;
        price: z.ZodNumber;
        compareAtPrice: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodNumber;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        sku: string;
        attributes: Record<string, string>;
        price: number;
        stock: number;
        compareAtPrice?: number | undefined;
        image?: string | undefined;
    }, {
        name: string;
        id: string;
        sku: string;
        attributes: Record<string, string>;
        price: number;
        stock: number;
        compareAtPrice?: number | undefined;
        image?: string | undefined;
    }>, "many">>;
    images: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        url: z.ZodString;
        publicId: z.ZodString;
        blurDataUrl: z.ZodOptional<z.ZodString>;
        alt: z.ZodString;
        altBn: z.ZodOptional<z.ZodString>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        displayOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string;
        publicId: string;
        alt: string;
        isPrimary: boolean;
        displayOrder: number;
        blurDataUrl?: string | undefined;
        altBn?: string | undefined;
    }, {
        id: string;
        url: string;
        publicId: string;
        alt: string;
        blurDataUrl?: string | undefined;
        altBn?: string | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }>, "many">;
    seo: z.ZodDefault<z.ZodObject<{
        metaTitle: z.ZodOptional<z.ZodString>;
        metaDescription: z.ZodOptional<z.ZodString>;
        ogImage: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        ogImage?: string | undefined;
        keywords?: string[] | undefined;
    }, {
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        ogImage?: string | undefined;
        keywords?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "published";
    name: string;
    slug: string;
    sku: string;
    price: number;
    stock: number;
    description: string;
    trackStock: boolean;
    lowStockThreshold: number;
    categoryIds: string[];
    tags: string[];
    variants: {
        name: string;
        id: string;
        sku: string;
        attributes: Record<string, string>;
        price: number;
        stock: number;
        compareAtPrice?: number | undefined;
        image?: string | undefined;
    }[];
    images: {
        id: string;
        url: string;
        publicId: string;
        alt: string;
        isPrimary: boolean;
        displayOrder: number;
        blurDataUrl?: string | undefined;
        altBn?: string | undefined;
    }[];
    seo: {
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        ogImage?: string | undefined;
        keywords?: string[] | undefined;
    };
    nameBn?: string | undefined;
    compareAtPrice?: number | undefined;
    descriptionBn?: string | undefined;
    costPrice?: number | undefined;
}, {
    name: string;
    slug: string;
    sku: string;
    price: number;
    stock: number;
    description: string;
    images: {
        id: string;
        url: string;
        publicId: string;
        alt: string;
        blurDataUrl?: string | undefined;
        altBn?: string | undefined;
        isPrimary?: boolean | undefined;
        displayOrder?: number | undefined;
    }[];
    status?: "draft" | "published" | undefined;
    nameBn?: string | undefined;
    compareAtPrice?: number | undefined;
    descriptionBn?: string | undefined;
    costPrice?: number | undefined;
    trackStock?: boolean | undefined;
    lowStockThreshold?: number | undefined;
    categoryIds?: string[] | undefined;
    tags?: string[] | undefined;
    variants?: {
        name: string;
        id: string;
        sku: string;
        attributes: Record<string, string>;
        price: number;
        stock: number;
        compareAtPrice?: number | undefined;
        image?: string | undefined;
    }[] | undefined;
    seo?: {
        metaTitle?: string | undefined;
        metaDescription?: string | undefined;
        ogImage?: string | undefined;
        keywords?: string[] | undefined;
    } | undefined;
}>;
export declare const OrderItemSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    productName: z.ZodString;
    variantName: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    total: z.ZodNumber;
    image: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sku: string;
    price: number;
    productId: string;
    productName: string;
    quantity: number;
    total: number;
    image?: string | undefined;
    variantId?: string | undefined;
    variantName?: string | undefined;
}, {
    sku: string;
    price: number;
    productId: string;
    productName: string;
    quantity: number;
    total: number;
    image?: string | undefined;
    variantId?: string | undefined;
    variantName?: string | undefined;
}>;
export declare const OrderCheckoutSchema: z.ZodObject<{
    customer: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        email?: string | undefined;
        notes?: string | undefined;
    }, {
        name: string;
        phone: string;
        email?: string | undefined;
        notes?: string | undefined;
    }>;
    shippingAddress: z.ZodObject<{
        address: z.ZodString;
        city: z.ZodString;
        district: z.ZodString;
        postalCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        city: string;
        district: string;
        postalCode?: string | undefined;
    }, {
        address: string;
        city: string;
        district: string;
        postalCode?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        productName: z.ZodString;
        variantName: z.ZodOptional<z.ZodString>;
        sku: z.ZodString;
        price: z.ZodNumber;
        quantity: z.ZodNumber;
        total: z.ZodNumber;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sku: string;
        price: number;
        productId: string;
        productName: string;
        quantity: number;
        total: number;
        image?: string | undefined;
        variantId?: string | undefined;
        variantName?: string | undefined;
    }, {
        sku: string;
        price: number;
        productId: string;
        productName: string;
        quantity: number;
        total: number;
        image?: string | undefined;
        variantId?: string | undefined;
        variantName?: string | undefined;
    }>, "many">;
    paymentMethod: z.ZodEnum<["cod", "bkash", "nagad", "sslcommerz"]>;
}, "strip", z.ZodTypeAny, {
    customer: {
        name: string;
        phone: string;
        email?: string | undefined;
        notes?: string | undefined;
    };
    shippingAddress: {
        address: string;
        city: string;
        district: string;
        postalCode?: string | undefined;
    };
    items: {
        sku: string;
        price: number;
        productId: string;
        productName: string;
        quantity: number;
        total: number;
        image?: string | undefined;
        variantId?: string | undefined;
        variantName?: string | undefined;
    }[];
    paymentMethod: "cod" | "bkash" | "nagad" | "sslcommerz";
}, {
    customer: {
        name: string;
        phone: string;
        email?: string | undefined;
        notes?: string | undefined;
    };
    shippingAddress: {
        address: string;
        city: string;
        district: string;
        postalCode?: string | undefined;
    };
    items: {
        sku: string;
        price: number;
        productId: string;
        productName: string;
        quantity: number;
        total: number;
        image?: string | undefined;
        variantId?: string | undefined;
        variantName?: string | undefined;
    }[];
    paymentMethod: "cod" | "bkash" | "nagad" | "sslcommerz";
}>;
export declare const StoreSettingsSchema: z.ZodObject<{
    general: z.ZodObject<{
        storeName: z.ZodString;
        storeNameBn: z.ZodOptional<z.ZodString>;
        phone: z.ZodString;
        email: z.ZodString;
        currency: z.ZodDefault<z.ZodEnum<["BDT", "USD"]>>;
        currencySymbol: z.ZodDefault<z.ZodString>;
        logoUrl: z.ZodOptional<z.ZodString>;
        faviconUrl: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        addressBn: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        email: string;
        storeName: string;
        currency: "BDT" | "USD";
        currencySymbol: string;
        address?: string | undefined;
        storeNameBn?: string | undefined;
        logoUrl?: string | undefined;
        faviconUrl?: string | undefined;
        addressBn?: string | undefined;
    }, {
        phone: string;
        email: string;
        storeName: string;
        address?: string | undefined;
        storeNameBn?: string | undefined;
        currency?: "BDT" | "USD" | undefined;
        currencySymbol?: string | undefined;
        logoUrl?: string | undefined;
        faviconUrl?: string | undefined;
        addressBn?: string | undefined;
    }>;
    theme: z.ZodObject<{
        primaryColor: z.ZodString;
        accentColor: z.ZodString;
        font: z.ZodDefault<z.ZodEnum<["Hind Siliguri", "Tiro Bangla", "Inter"]>>;
        headerStyle: z.ZodDefault<z.ZodEnum<["standard", "centered", "minimal"]>>;
        footerText: z.ZodOptional<z.ZodString>;
        footerTextBn: z.ZodOptional<z.ZodString>;
        heroBanners: z.ZodDefault<z.ZodArray<z.ZodObject<{
            imageUrl: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            subtitle: z.ZodOptional<z.ZodString>;
            linkUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }, {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        accentColor: string;
        font: "Hind Siliguri" | "Tiro Bangla" | "Inter";
        headerStyle: "standard" | "centered" | "minimal";
        heroBanners: {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }[];
        footerText?: string | undefined;
        footerTextBn?: string | undefined;
    }, {
        primaryColor: string;
        accentColor: string;
        font?: "Hind Siliguri" | "Tiro Bangla" | "Inter" | undefined;
        headerStyle?: "standard" | "centered" | "minimal" | undefined;
        footerText?: string | undefined;
        footerTextBn?: string | undefined;
        heroBanners?: {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }[] | undefined;
    }>;
    payment: z.ZodObject<{
        codEnabled: z.ZodDefault<z.ZodBoolean>;
        codInstructions: z.ZodOptional<z.ZodString>;
        bkashEnabled: z.ZodDefault<z.ZodBoolean>;
        bkashMerchantNumber: z.ZodOptional<z.ZodString>;
        bkashType: z.ZodOptional<z.ZodEnum<["merchant", "personal"]>>;
        nagadEnabled: z.ZodDefault<z.ZodBoolean>;
        nagadMerchantNumber: z.ZodOptional<z.ZodString>;
        sslcommerzEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        codEnabled: boolean;
        bkashEnabled: boolean;
        nagadEnabled: boolean;
        sslcommerzEnabled: boolean;
        codInstructions?: string | undefined;
        bkashMerchantNumber?: string | undefined;
        bkashType?: "merchant" | "personal" | undefined;
        nagadMerchantNumber?: string | undefined;
    }, {
        codEnabled?: boolean | undefined;
        codInstructions?: string | undefined;
        bkashEnabled?: boolean | undefined;
        bkashMerchantNumber?: string | undefined;
        bkashType?: "merchant" | "personal" | undefined;
        nagadEnabled?: boolean | undefined;
        nagadMerchantNumber?: string | undefined;
        sslcommerzEnabled?: boolean | undefined;
    }>;
    shipping: z.ZodObject<{
        insideDhakaFee: z.ZodDefault<z.ZodNumber>;
        outsideDhakaFee: z.ZodDefault<z.ZodNumber>;
        freeShippingMinAmount: z.ZodOptional<z.ZodNumber>;
        courierProvider: z.ZodDefault<z.ZodEnum<["steadfast", "pathao", "redx", "manual"]>>;
    }, "strip", z.ZodTypeAny, {
        insideDhakaFee: number;
        outsideDhakaFee: number;
        courierProvider: "manual" | "steadfast" | "pathao" | "redx";
        freeShippingMinAmount?: number | undefined;
    }, {
        insideDhakaFee?: number | undefined;
        outsideDhakaFee?: number | undefined;
        freeShippingMinAmount?: number | undefined;
        courierProvider?: "manual" | "steadfast" | "pathao" | "redx" | undefined;
    }>;
    seo: z.ZodObject<{
        defaultMetaTitle: z.ZodString;
        defaultMetaDescription: z.ZodString;
        defaultOgImage: z.ZodOptional<z.ZodString>;
        googleSearchConsoleId: z.ZodOptional<z.ZodString>;
        googleAnalyticsId: z.ZodOptional<z.ZodString>;
        facebookPixelId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultMetaTitle: string;
        defaultMetaDescription: string;
        defaultOgImage?: string | undefined;
        googleSearchConsoleId?: string | undefined;
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
    }, {
        defaultMetaTitle: string;
        defaultMetaDescription: string;
        defaultOgImage?: string | undefined;
        googleSearchConsoleId?: string | undefined;
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    seo: {
        defaultMetaTitle: string;
        defaultMetaDescription: string;
        defaultOgImage?: string | undefined;
        googleSearchConsoleId?: string | undefined;
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
    };
    general: {
        phone: string;
        email: string;
        storeName: string;
        currency: "BDT" | "USD";
        currencySymbol: string;
        address?: string | undefined;
        storeNameBn?: string | undefined;
        logoUrl?: string | undefined;
        faviconUrl?: string | undefined;
        addressBn?: string | undefined;
    };
    theme: {
        primaryColor: string;
        accentColor: string;
        font: "Hind Siliguri" | "Tiro Bangla" | "Inter";
        headerStyle: "standard" | "centered" | "minimal";
        heroBanners: {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }[];
        footerText?: string | undefined;
        footerTextBn?: string | undefined;
    };
    payment: {
        codEnabled: boolean;
        bkashEnabled: boolean;
        nagadEnabled: boolean;
        sslcommerzEnabled: boolean;
        codInstructions?: string | undefined;
        bkashMerchantNumber?: string | undefined;
        bkashType?: "merchant" | "personal" | undefined;
        nagadMerchantNumber?: string | undefined;
    };
    shipping: {
        insideDhakaFee: number;
        outsideDhakaFee: number;
        courierProvider: "manual" | "steadfast" | "pathao" | "redx";
        freeShippingMinAmount?: number | undefined;
    };
}, {
    seo: {
        defaultMetaTitle: string;
        defaultMetaDescription: string;
        defaultOgImage?: string | undefined;
        googleSearchConsoleId?: string | undefined;
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
    };
    general: {
        phone: string;
        email: string;
        storeName: string;
        address?: string | undefined;
        storeNameBn?: string | undefined;
        currency?: "BDT" | "USD" | undefined;
        currencySymbol?: string | undefined;
        logoUrl?: string | undefined;
        faviconUrl?: string | undefined;
        addressBn?: string | undefined;
    };
    theme: {
        primaryColor: string;
        accentColor: string;
        font?: "Hind Siliguri" | "Tiro Bangla" | "Inter" | undefined;
        headerStyle?: "standard" | "centered" | "minimal" | undefined;
        footerText?: string | undefined;
        footerTextBn?: string | undefined;
        heroBanners?: {
            imageUrl: string;
            title?: string | undefined;
            subtitle?: string | undefined;
            linkUrl?: string | undefined;
        }[] | undefined;
    };
    payment: {
        codEnabled?: boolean | undefined;
        codInstructions?: string | undefined;
        bkashEnabled?: boolean | undefined;
        bkashMerchantNumber?: string | undefined;
        bkashType?: "merchant" | "personal" | undefined;
        nagadEnabled?: boolean | undefined;
        nagadMerchantNumber?: string | undefined;
        sslcommerzEnabled?: boolean | undefined;
    };
    shipping: {
        insideDhakaFee?: number | undefined;
        outsideDhakaFee?: number | undefined;
        freeShippingMinAmount?: number | undefined;
        courierProvider?: "manual" | "steadfast" | "pathao" | "redx" | undefined;
    };
}>;
//# sourceMappingURL=index.d.ts.map
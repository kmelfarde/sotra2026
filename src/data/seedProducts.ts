import { Product, StoreCategory, OutfitBundle } from '../types';

export const SEED_CATEGORIES: StoreCategory[] = [
  {
    id: 'all',
    name: 'All Products',
    nameAr: 'كل المنتجات',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=900&auto=format&fit=crop',
    count: 6,
    showInShopByCategory: false
  },
  {
    id: 'tops',
    name: 'Tops & Tees',
    nameAr: 'تيشيرتات وهوديز كاجوال',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
    count: 2,
    showInShopByCategory: true
  },
  {
    id: 'bottoms',
    name: 'Pants & Bottoms',
    nameAr: 'بناطيل وشورتات كاجوال',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=900&auto=format&fit=crop',
    count: 1,
    showInShopByCategory: true
  },
  {
    id: 'compressions',
    name: 'Compression & Base',
    nameAr: 'ملابس ضاغطة ومشدات',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop',
    count: 1,
    showInShopByCategory: true
  },
  {
    id: 'tanks',
    name: 'Tanks & Sleeveless',
    nameAr: 'ملابس كت وتانك',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=900&auto=format&fit=crop',
    count: 1,
    showInShopByCategory: true
  },
  {
    id: 'accessories',
    name: 'Bags & Accessories',
    nameAr: 'حقائب واكسسوارات',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=900&auto=format&fit=crop',
    count: 1,
    showInShopByCategory: true
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'sotra-oversized-tee-black',
    name: 'SOTRA Signature Oversized Heavy Tee',
    nameAr: 'تيشيرت سوترة أوفر سايز فاخر - قطن 100%',
    category: 'tops',
    fit: 'Oversized Boxy Fit',
    fitAr: 'قصة أوفر سايز بوكسي واسعة ومريحة',
    originalPrice: 650,
    discountedPrice: 480,
    discountPercent: 26,
    badge: 'BEST SELLER',
    showInNewArrivals: true,
    showInBestSellers: true,
    rating: 4.9,
    reviewCount: 38,
    description: 'Ultra-heavyweight 240 GSM combed Egyptian cotton tee. Tailored boxy silhouette with reinforced ribbed collar.',
    descriptionAr: 'تيشيرت قطن مصري فاخر وزن 240 جرام معالج ضد الانكماش مع ياقة مضلعة متماسكة وقصة عصرية مريحة.',
    fabric: '100% Combed Compact Cotton - 240 GSM',
    fabricAr: 'قطن مصري 100% ممشط عالي الكثافة 240 جرام',
    modelInfo: 'Model is 182cm / 80kg wearing size L',
    modelInfoAr: 'طول الموديل 182 سم ووزن 80 كجم يرتدي مقاس L',
    features: [
      'Heavyweight 240 GSM pre-shrunk cotton',
      'Drop-shoulder boxy modern cut',
      'High-durability color fastness'
    ],
    featuresAr: [
      'قطن ثقيل 240 جرام معالج مسبقاً ضد الانكماش',
      'قصة أكتاف ساقطة عصرية ومظهر مهندم',
      'ثبات ألوان استثنائي يقاوم الغسيل المتكرر'
    ],
    careInstructions: ['Machine wash cold at 30°C', 'Wash inside out', 'Do not tumble dry'],
    colors: [
      {
        id: 'c-black',
        name: 'Jet Black',
        hex: '#111827',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'c-offwhite',
        name: 'Off White',
        hex: '#f3f4f6',
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'c-sage',
        name: 'Sage Olive',
        hex: '#4b5563',
        images: [
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'M', inStock: true, stockCount: 20 },
      { size: 'L', inStock: true, stockCount: 35 },
      { size: 'XL', inStock: true, stockCount: 25 },
      { size: 'XXL', inStock: true, stockCount: 15 }
    ],
    complementaryProductId: 'sotra-relaxed-cargo-pants',
    complementaryDiscountPercent: 20,
    outfitImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=900&auto=format&fit=crop'
    ],
    displayOrder: 1
  },
  {
    id: 'sotra-relaxed-cargo-pants',
    name: 'SOTRA Tactical Relaxed Cargo Pants',
    nameAr: 'بنطلون كارغو ستريت وير بقصة مريحة',
    category: 'bottoms',
    fit: 'Relaxed Tapered Fit',
    fitAr: 'قصة واسعة مريحة بتدريج سفلي متناسق',
    originalPrice: 890,
    discountedPrice: 690,
    discountPercent: 22,
    badge: 'POPULAR',
    showInNewArrivals: true,
    showInBestSellers: true,
    rating: 4.8,
    reviewCount: 29,
    description: 'Modern utility cargo trousers featuring 6 functional pockets, elastic drawstring waistband, and premium cotton twill build.',
    descriptionAr: 'بنطلون كارغو ستريت وير عملي بخامة تويل قطنية متينة مع 6 جيوب وخصر مطاطي برباط لتعديل المقاس بسهولة.',
    fabric: '97% Cotton Twill, 3% Elastane',
    fabricAr: '97% قطن تويل فاخر، 3% ليكرا لمرونة إضافية',
    modelInfo: 'Model is 182cm wearing size L',
    modelInfoAr: 'طول الموديل 182 سم يرتدي مقاس L',
    features: [
      'Deep dual cargo utility pockets',
      'Elastic adjustable waistband with heavy aglet drawstrings',
      'Durable reinforced knee paneling'
    ],
    featuresAr: [
      'جيوب جانبية عميقة بإغلاق محكم',
      'خصر مطاطي مريح مع أربطة معدنية متينة',
      'خياطة مزدوجة معززة في مناطق الحركة'
    ],
    careInstructions: ['Machine wash inside out 30°C', 'Iron on low temperature'],
    colors: [
      {
        id: 'c-charcoal',
        name: 'Matte Black',
        hex: '#18181b',
        images: [
          'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'c-olive',
        name: 'Military Olive',
        hex: '#3f3f46',
        images: [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'M (30-32)', inStock: true, stockCount: 15 },
      { size: 'L (32-34)', inStock: true, stockCount: 30 },
      { size: 'XL (34-36)', inStock: true, stockCount: 20 },
      { size: 'XXL (36-38)', inStock: true, stockCount: 12 }
    ],
    complementaryProductId: 'sotra-street-heavyweight-hoodie',
    complementaryDiscountPercent: 25,
    outfitImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop'
    ],
    displayOrder: 2
  },
  {
    id: 'sotra-street-heavyweight-hoodie',
    name: 'SOTRA Raw Cut Heavyweight Hoodie',
    nameAr: 'هودي سوترة قطن ثقيل بقصة واسعة',
    category: 'tops',
    fit: 'Relaxed Drop-Shoulder Fit',
    fitAr: 'قصة واسعة دافئة وأكتاف ساقطة',
    originalPrice: 1100,
    discountedPrice: 850,
    discountPercent: 23,
    badge: 'WINTER ESSENTIAL',
    showInNewArrivals: true,
    showInBestSellers: true,
    rating: 4.9,
    reviewCount: 45,
    description: '400 GSM double-faced fleece cotton hoodie. Double layered hood without drawstrings for a sleek minimal aesthetic.',
    descriptionAr: 'هودي فاخر قطن مصري كثيف 400 جرام مع بطانة ناعمة وياقة مزدوجة بدون أربطة لمظهر عصري أنيق ومينيمال.',
    fabric: '100% Egyptian Brushed Cotton - 400 GSM',
    fabricAr: 'قطن مصري 100% مبطن ناعم عالي الكثافة 400 جرام',
    modelInfo: 'Model is 185cm wearing size XL',
    modelInfoAr: 'طول الموديل 185 سم يرتدي مقاس XL',
    features: [
      'Ultra heavyweight 400 GSM brushed fleece',
      'Clean minimal silhouette without drawstrings',
      'Wide ribbed cuffs and hem'
    ],
    featuresAr: [
      'خامة قطنية فائقة الثقل 400 جرام دافئة للغاية',
      'تصميم مينيمال راقٍ بدون حبال متدلية',
      'أساور وخصر مضلع متماسك يحافظ على القصة'
    ],
    careInstructions: ['Machine wash cold', 'Dry flat in shade', 'Do not bleach'],
    colors: [
      {
        id: 'c-washed-black',
        name: 'Washed Charcoal',
        hex: '#27272a',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=900&auto=format&fit=crop'
        ]
      },
      {
        id: 'c-sand',
        name: 'Desert Sand',
        hex: '#d4d4d8',
        images: [
          'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'M', inStock: true, stockCount: 18 },
      { size: 'L', inStock: true, stockCount: 25 },
      { size: 'XL', inStock: true, stockCount: 22 },
      { size: 'XXL', inStock: true, stockCount: 10 }
    ],
    complementaryProductId: 'sotra-relaxed-cargo-pants',
    complementaryDiscountPercent: 20,
    outfitImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop'
    ],
    displayOrder: 3
  },
  {
    id: 'sotra-compression-pro-base',
    name: 'SOTRA Pro Compression Base Layer',
    nameAr: 'تيشيرت ضاغط رياضي احترافي Pro Fit',
    category: 'compressions',
    fit: 'Second-Skin Compression',
    fitAr: 'قصة ضاغطة ومريحة للجسم',
    originalPrice: 580,
    discountedPrice: 420,
    discountPercent: 28,
    badge: 'ATHLETIC',
    showInNewArrivals: false,
    showInBestSellers: true,
    rating: 4.7,
    reviewCount: 22,
    description: 'Engineered moisture-wicking compression top with 4-way stretch fabric for athletic performance and posture support.',
    descriptionAr: 'تيشيرت ضاغط رياضي عالي المرونة طارد للعرق يوفر دعماً للعضلات أثناء التمارين والنشاط اليومي.',
    fabric: '88% Polyamide, 12% Spandex',
    fabricAr: '88% بولياميد ناعم، 12% سباندكس فائق التمدد',
    modelInfo: 'Model is 180cm wearing size M',
    modelInfoAr: 'طول الموديل 180 سم يرتدي مقاس M',
    features: ['4-Way Stretch Ergonomic Fit', 'Moisture-Wicking Quick Dry Technology', 'Anti-Chafing Flatlock Seams'],
    featuresAr: ['تمدد كامل في 4 اتجاهات لدعم الحركة', 'تقنية تجفيف سريع طاردة للرطوبة', 'درزات مسطحة ناعمة ضد الاحتكاك'],
    careInstructions: ['Machine wash cold 30°C', 'Do not iron on prints'],
    colors: [
      {
        id: 'c-stealth',
        name: 'Stealth Black',
        hex: '#09090b',
        images: [
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'S', inStock: true, stockCount: 15 },
      { size: 'M', inStock: true, stockCount: 25 },
      { size: 'L', inStock: true, stockCount: 20 },
      { size: 'XL', inStock: true, stockCount: 14 }
    ],
    complementaryProductId: 'sotra-oversized-tee-black',
    complementaryDiscountPercent: 15,
    outfitImages: [],
    displayOrder: 4
  },
  {
    id: 'sotra-drop-arm-tank',
    name: 'SOTRA Raw Cut Drop Arm Tank',
    nameAr: 'تانك توب رياضي كت بقصة عصرية',
    category: 'tanks',
    fit: 'Drop Armhole Muscle Fit',
    fitAr: 'قصة كت مفتوحة ومريحة',
    originalPrice: 450,
    discountedPrice: 340,
    discountPercent: 24,
    badge: '',
    showInNewArrivals: false,
    showInBestSellers: false,
    rating: 4.6,
    reviewCount: 17,
    description: 'Lightweight breathable cotton jersey muscle tank with deep cut armholes and raw edge hemline.',
    descriptionAr: 'تانك توب قطني خفيف ومسامي بقصة أكتاف مفتوحة لتهوية مثالية أثناء التمرين والطقس الحار.',
    fabric: '100% Breathable Cotton',
    fabricAr: '100% قطن طبيعي مسامي فائق النعومة',
    modelInfo: 'Model is 182cm wearing size L',
    modelInfoAr: 'طول الموديل 182 سم يرتدي مقاس L',
    features: ['Deep drop-arm cut', 'Lightweight breathable jersey', 'Tagless comfort neck'],
    featuresAr: ['فتحة ذراع واسعة لحرية الحركة', 'نسيج قطني خفيف يسمح بمرور الهواء', 'ياقة مريحة خالية من العلامات المزعجة'],
    careInstructions: ['Machine wash 30°C', 'Hang dry'],
    colors: [
      {
        id: 'c-black-tank',
        name: 'Pure Black',
        hex: '#18181b',
        images: [
          'https://images.unsplash.com/photo-1584865288642-42078afe6942?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'M', inStock: true, stockCount: 20 },
      { size: 'L', inStock: true, stockCount: 25 },
      { size: 'XL', inStock: true, stockCount: 15 }
    ],
    complementaryProductId: 'sotra-relaxed-cargo-pants',
    complementaryDiscountPercent: 15,
    outfitImages: [],
    displayOrder: 5
  },
  {
    id: 'sotra-utility-crossbody-bag',
    name: 'SOTRA Tactical Crossbody Utility Bag',
    nameAr: 'حقيبة كروس بودي سوترة تكتيكية مقاومة للماء',
    category: 'accessories',
    fit: 'One Size Adjustable',
    fitAr: 'مقاس موحد مع حزام قابل للتعديل',
    originalPrice: 480,
    discountedPrice: 370,
    discountPercent: 23,
    badge: 'NEW',
    showInNewArrivals: true,
    showInBestSellers: false,
    rating: 4.9,
    reviewCount: 31,
    description: 'Water-resistant Cordura utility crossbody bag with waterproof zippers and quick-release buckle.',
    descriptionAr: 'حقيبة كروس بودي تكتيكية خفيفة ومقاومة للماء مصممة لحمل الهاتف والمحفظة والمفاتيح بأمان وأناقة.',
    fabric: 'Water-Resistant Cordura Nylon',
    fabricAr: 'نايلون كوردورا متين ومقاوم لرذاذ الماء',
    modelInfo: 'Universal Adjustable Strap',
    modelInfoAr: 'حزام كتف عريض قابل للتعديل والإزالة',
    features: ['Water-resistant zippers', 'Multiple organizing compartments', 'High-strength buckle'],
    featuresAr: ['سحابات مقاومة لتسرب الماء', 'جيوب تنظيمية داخلية وخارجية', 'إبزيم قوي وسهل الفتح'],
    careInstructions: ['Wipe clean with damp cloth'],
    colors: [
      {
        id: 'c-bag-black',
        name: 'Matte Tactical Black',
        hex: '#09090b',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=900&auto=format&fit=crop'
        ]
      }
    ],
    sizes: [
      { size: 'One Size', inStock: true, stockCount: 40 }
    ],
    complementaryProductId: 'sotra-oversized-tee-black',
    complementaryDiscountPercent: 15,
    outfitImages: [],
    displayOrder: 6
  }
];

export const SEED_BUNDLES: OutfitBundle[] = [
  {
    id: 'bundle-street-signature',
    name: 'SOTRA Signature Street Outfit',
    nameAr: 'طقم ستريت وير سوترة المتكامل',
    tagline: 'Oversized Tee + Tactical Cargo Pants',
    taglineAr: 'تيشيرت أوفر سايز + بنطلون كارغو ستريت',
    description: 'Coordinated modern streetwear outfit pairing the oversized heavy tee with relaxed cargo pants. Choose your exact size and color for each piece.',
    descriptionAr: 'إطلالة ستريت وير عصرية متكاملة تجمع بين التيشيرت الأوفر سايز الثقيل وبنطلون الكارغو المريح مع إمكانية تحديد مقاس ولون كل قطعة.',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=900&auto=format&fit=crop'
    ],
    productIds: ['sotra-oversized-tee-black', 'sotra-relaxed-cargo-pants'],
    originalPrice: 1540,
    bundlePrice: 1050,
    discountPercent: 32,
    badge: 'BEST VALUE',
    badgeAr: 'وفر 490 ج.م'
  },
  {
    id: 'bundle-urban-warmth',
    name: 'SOTRA Urban Heavy Hoodie & Cargo Set',
    nameAr: 'طقم الهودي والكارغو الشتوي',
    tagline: 'Heavyweight Fleece Hoodie + Relaxed Cargo Pants',
    taglineAr: 'هودي قطن ثقيل 400 جرام + بنطلون كارغو تكتيكي',
    description: 'Complete winter street look pairing the ultra-heavy raw-cut hoodie with durable cargo trousers. Full warmth and effortless style.',
    descriptionAr: 'طقم شتوي أنيق ودافئ يجمع بين الهودي القطني فائق الثقل وبنطلون الكارغو، مع توفير خاص عند طلب الطقم معاً.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=900&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=900&auto=format&fit=crop'
    ],
    productIds: ['sotra-street-heavyweight-hoodie', 'sotra-relaxed-cargo-pants'],
    originalPrice: 1990,
    bundlePrice: 1450,
    discountPercent: 27,
    badge: 'HOT BUNDLE',
    badgeAr: 'وفر 540 ج.م'
  }
];

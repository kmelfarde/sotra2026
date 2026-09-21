import {
  getSettingDoc,
  saveSettingDoc,
  clearAllDummyCatalogDataFromFirestore,
  fetchAllProducts,
  fetchAllCategories,
  fetchAllBundles,
  saveProductsBatchToFirestore,
  saveCategoriesBatchToFirestore,
  saveBundlesBatchToFirestore
} from './db';
import {
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_SUPPORT_SETTINGS,
  DEFAULT_WALLET_SETTINGS,
  DEFAULT_GOVERNORATES_RATES,
  DEFAULT_BROADCAST_NOTIFICATION,
  DEFAULT_PROMO_POPUP,
  DEFAULT_HERO_BANNER_SETTINGS,
  DEFAULT_TOP_ANNOUNCEMENT_SETTINGS,
  DEFAULT_FREE_SHIPPING_SETTINGS,
  DEFAULT_PROMO_CODES,
  DEFAULT_STORE_NOTIFICATIONS
} from '../utils/storeSettings';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_BUNDLES } from '../data/seedProducts';

let isSeeding = false;

/**
 * Completely purges all products, bundles, categories, and orders from Firestore and localStorage.
 * Only triggered manually by admin request with explicit confirmation.
 */
export async function zeroOutStoreCompletely(): Promise<void> {
  try {
    console.log('Zeroing out store: deleting all products, bundles, categories, and orders from Firestore...');
    await clearAllDummyCatalogDataFromFirestore();
    try {
      localStorage.removeItem('sotra_products_data');
      localStorage.removeItem('sotra_bundles_data');
      localStorage.removeItem('sotra_categories_data');
      localStorage.removeItem('sotra_customer_orders');
      localStorage.removeItem('sotra_cart');
      localStorage.removeItem('sotra_acknowledged_orders');
    } catch (storageErr) {
      console.error('Storage purge error:', storageErr);
    }
    console.log('Store successfully zeroed out in Firestore and local storage.');
  } catch (err) {
    console.error('Failed to zero out store in Firestore:', err);
  }
}

/**
 * Initializes Firestore operational settings and default catalog if Firestore is completely empty.
 * Never overwrites existing user data.
 */
export async function initializeFirestoreDataIfNeeded(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    // 1. Check and seed Categories in Firestore if missing or empty
    const existingCategories = await fetchAllCategories();
    if (!existingCategories || existingCategories.length === 0) {
      console.log('Categories empty in Firestore, seeding initial categories...');
      await saveCategoriesBatchToFirestore(SEED_CATEGORIES);
    }

    // 2. Check and seed Products in Firestore if missing or empty
    const existingProducts = await fetchAllProducts();
    if (!existingProducts || existingProducts.length === 0) {
      console.log('Products empty in Firestore, seeding initial clothing catalog...');
      await saveProductsBatchToFirestore(SEED_PRODUCTS);
    }

    // 3. Check and seed Outfit Bundles in Firestore if missing or empty
    const existingBundles = await fetchAllBundles();
    if (!existingBundles || existingBundles.length === 0) {
      console.log('Bundles empty in Firestore, seeding initial outfit bundles...');
      await saveBundlesBatchToFirestore(SEED_BUNDLES);
    }

    // 4. Check & Seed Store Settings in Firestore (only if missing)
    const footer = await getSettingDoc('footer');
    if (!footer) {
      await saveSettingDoc('footer', DEFAULT_FOOTER_SETTINGS);
    }

    const support = await getSettingDoc('support');
    if (!support) {
      await saveSettingDoc('support', DEFAULT_SUPPORT_SETTINGS);
    }

    const wallet = await getSettingDoc('wallet');
    if (!wallet) {
      await saveSettingDoc('wallet', DEFAULT_WALLET_SETTINGS);
    }

    const governorates = await getSettingDoc('governorates');
    if (!governorates) {
      await saveSettingDoc('governorates', DEFAULT_GOVERNORATES_RATES);
    }

    const notification = await getSettingDoc('broadcast_notification');
    if (!notification) {
      await saveSettingDoc('broadcast_notification', DEFAULT_BROADCAST_NOTIFICATION);
    }

    const promoPopup = await getSettingDoc('site_promo_popup');
    if (!promoPopup) {
      await saveSettingDoc('site_promo_popup', DEFAULT_PROMO_POPUP);
    }

    const heroBanner = await getSettingDoc('hero_banner');
    if (!heroBanner) {
      await saveSettingDoc('hero_banner', DEFAULT_HERO_BANNER_SETTINGS);
    }

    const topAnnouncement = await getSettingDoc('top_announcement');
    if (!topAnnouncement) {
      await saveSettingDoc('top_announcement', DEFAULT_TOP_ANNOUNCEMENT_SETTINGS);
    }

    const freeShipping = await getSettingDoc('free_shipping');
    if (!freeShipping) {
      await saveSettingDoc('free_shipping', DEFAULT_FREE_SHIPPING_SETTINGS);
    }

    const promoCodes = await getSettingDoc('promo_codes');
    if (!promoCodes) {
      await saveSettingDoc('promo_codes', DEFAULT_PROMO_CODES);
    }

    const notificationsList = await getSettingDoc('notifications_list');
    if (!notificationsList) {
      await saveSettingDoc('notifications_list', DEFAULT_STORE_NOTIFICATIONS);
    }

    console.log('Firestore initialized successfully and verified.');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
  } finally {
    isSeeding = false;
  }
}

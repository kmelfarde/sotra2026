import {
  fetchAllCategories,
  saveCategoryToFirestore,
  getSettingDoc,
  saveSettingDoc,
  clearAllDummyCatalogDataFromFirestore
} from './db';
import { CATEGORIES_DATA } from '../data/products';
import {
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_SUPPORT_SETTINGS,
  DEFAULT_WALLET_SETTINGS,
  DEFAULT_GOVERNORATES_RATES,
  DEFAULT_BROADCAST_NOTIFICATION,
  DEFAULT_PROMO_POPUP
} from '../utils/storeSettings';

let isSeeding = false;

/**
 * Completely purges all products, bundles, and orders from Firestore and localStorage.
 * Keeps category taxonomy and store operational settings intact.
 */
export async function zeroOutStoreCompletely(): Promise<void> {
  try {
    console.log('Zeroing out store: deleting all products, bundles, and orders from Firestore...');
    await clearAllDummyCatalogDataFromFirestore();
    try {
      localStorage.removeItem('sotra_products_data');
      localStorage.removeItem('sotra_bundles_data');
      localStorage.removeItem('sotra_customer_orders');
      localStorage.removeItem('sotra_cart');
      localStorage.removeItem('sotra_acknowledged_orders');
      localStorage.setItem('sotra_site_zeroed_clean_v2', 'true');
    } catch (storageErr) {
      console.error('Storage purge error:', storageErr);
    }
    console.log('Store successfully zeroed out in Firestore and local storage.');
  } catch (err) {
    console.error('Failed to zero out store in Firestore:', err);
  }
}

/**
 * Initializes Firestore collections and ensures all demo products/bundles/orders are purged.
 * Leaves the database completely zeroed out, ready for live product entry through the admin dashboard.
 */
export async function initializeFirestoreDataIfNeeded(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    // 1. Ensure store is zeroed out if not yet done in this session
    const isZeroed = localStorage.getItem('sotra_site_zeroed_clean_v2');
    if (!isZeroed) {
      await zeroOutStoreCompletely();
    }

    // 2. Check & Seed Store Categories Structure (Categories taxonomy with 0 counts)
    const existingCategories = await fetchAllCategories();
    if (existingCategories.length === 0) {
      console.log('Initializing store categories structure into Firestore...');
      for (const cat of CATEGORIES_DATA) {
        await saveCategoryToFirestore(cat);
      }
    }

    // 3. Check & Seed Store Settings (Keeping real store infrastructure ready)
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

    console.log('Firestore clean state verified: Ready for production use without demo data.');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
  } finally {
    isSeeding = false;
  }
}

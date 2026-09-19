import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import {
  Product,
  StoreCategory,
  OutfitBundle,
  CustomerOrder,
  FooterSettings,
  SupportSettings,
  WalletSettings,
  GovernorateRate,
  BroadcastNotification,
  SitePromoPopup
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collection references - 100% connected to Firestore
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BUNDLES: 'bundles',
  ORDERS: 'orders',
  SETTINGS: 'storeSettings'
} as const;

/**
 * Strips undefined values recursively so Firestore never throws
 * "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------

export function subscribeToProducts(callback: (products: Product[]) => void) {
  const q = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(
    q,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ ...(docSnap.data() as Product), id: docSnap.id });
      });
      products.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      callback(products);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PRODUCTS);
    }
  );
}

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const products: Product[] = [];
    snap.forEach((docSnap) => {
      products.push({ ...(docSnap.data() as Product), id: docSnap.id });
    });
    products.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PRODUCTS);
    return [];
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `${COLLECTIONS.PRODUCTS}/${product.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    const cleaned = sanitizeForFirestore({
      ...product,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProductsBatchToFirestore(products: Product[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const prod of products) {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, prod.id);
      const cleaned = sanitizeForFirestore({
        ...prod,
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef, cleaned);
    }
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, COLLECTIONS.PRODUCTS);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `${COLLECTIONS.PRODUCTS}/${productId}`;
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------

export function subscribeToCategories(callback: (categories: StoreCategory[]) => void) {
  const q = collection(db, COLLECTIONS.CATEGORIES);
  return onSnapshot(
    q,
    (snapshot) => {
      const categories: StoreCategory[] = [];
      snapshot.forEach((docSnap) => {
        categories.push({ ...(docSnap.data() as StoreCategory), id: docSnap.id });
      });
      callback(categories);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.CATEGORIES);
    }
  );
}

export async function fetchAllCategories(): Promise<StoreCategory[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories: StoreCategory[] = [];
    snap.forEach((docSnap) => {
      categories.push({ ...(docSnap.data() as StoreCategory), id: docSnap.id });
    });
    return categories;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.CATEGORIES);
    return [];
  }
}

export async function saveCategoryToFirestore(category: StoreCategory): Promise<void> {
  const path = `${COLLECTIONS.CATEGORIES}/${category.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
    const cleaned = sanitizeForFirestore({
      ...category,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function saveCategoriesBatchToFirestore(categories: StoreCategory[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const cat of categories) {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, cat.id);
      const cleaned = sanitizeForFirestore({
        ...cat,
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef, cleaned);
    }
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, COLLECTIONS.CATEGORIES);
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const path = `${COLLECTIONS.CATEGORIES}/${categoryId}`;
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// OUTFIT BUNDLES API
// -------------------------------------------------------------

export function subscribeToBundles(callback: (bundles: OutfitBundle[]) => void) {
  const q = collection(db, COLLECTIONS.BUNDLES);
  return onSnapshot(
    q,
    (snapshot) => {
      const bundles: OutfitBundle[] = [];
      snapshot.forEach((docSnap) => {
        bundles.push({ ...(docSnap.data() as OutfitBundle), id: docSnap.id });
      });
      callback(bundles);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.BUNDLES);
    }
  );
}

export async function fetchAllBundles(): Promise<OutfitBundle[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BUNDLES));
    const bundles: OutfitBundle[] = [];
    snap.forEach((docSnap) => {
      bundles.push({ ...(docSnap.data() as OutfitBundle), id: docSnap.id });
    });
    return bundles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.BUNDLES);
    return [];
  }
}

export async function saveBundleToFirestore(bundle: OutfitBundle): Promise<void> {
  const path = `${COLLECTIONS.BUNDLES}/${bundle.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.BUNDLES, bundle.id);
    const cleaned = sanitizeForFirestore({
      ...bundle,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function saveBundlesBatchToFirestore(bundles: OutfitBundle[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const bundle of bundles) {
      const docRef = doc(db, COLLECTIONS.BUNDLES, bundle.id);
      const cleaned = sanitizeForFirestore({
        ...bundle,
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef, cleaned);
    }
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, COLLECTIONS.BUNDLES);
  }
}

export async function deleteBundleFromFirestore(bundleId: string): Promise<void> {
  const path = `${COLLECTIONS.BUNDLES}/${bundleId}`;
  try {
    const docRef = doc(db, COLLECTIONS.BUNDLES, bundleId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// ORDERS API
// -------------------------------------------------------------

export function subscribeToOrders(callback: (orders: CustomerOrder[]) => void) {
  const q = collection(db, COLLECTIONS.ORDERS);
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ ...(docSnap.data() as CustomerOrder), orderId: docSnap.id });
      });
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(orders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.ORDERS);
    }
  );
}

export async function createOrderInFirestore(order: CustomerOrder): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${order.orderId}`;
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, order.orderId);
    const cleaned = sanitizeForFirestore({
      ...order,
      createdAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned);
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

export async function updateOrderInFirestore(orderId: string, updates: Partial<CustomerOrder>): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${orderId}`;
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const cleaned = sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    await updateDoc(docRef, cleaned);
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${orderId}`;
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function deleteAllOrdersFromFirestore(orderIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const id of orderIds) {
      const docRef = doc(db, COLLECTIONS.ORDERS, id);
      batch.delete(docRef);
    }
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, COLLECTIONS.ORDERS);
  }
}

// -------------------------------------------------------------
// STORE SETTINGS API (Footer, Support, Wallets, Rates, Notifications, Promo)
// -------------------------------------------------------------

export async function getSettingDoc<T>(settingKey: string): Promise<T | null> {
  const path = `${COLLECTIONS.SETTINGS}/${settingKey}`;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, settingKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return (snap.data() as { data: T }).data;
    }
    return null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
    return null;
  }
}

export async function saveSettingDoc<T>(settingKey: string, data: T): Promise<void> {
  const path = `${COLLECTIONS.SETTINGS}/${settingKey}`;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, settingKey);
    const cleaned = sanitizeForFirestore({
      data,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export function subscribeToSettingDoc<T>(settingKey: string, callback: (data: T | null) => void) {
  const path = `${COLLECTIONS.SETTINGS}/${settingKey}`;
  const docRef = doc(db, COLLECTIONS.SETTINGS, settingKey);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback((snap.data() as { data: T }).data);
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Purges all demo products, bundles, and demo orders from Firestore so the database
 * is completely clean and ready for real production usage.
 */
export async function clearAllDummyCatalogDataFromFirestore(): Promise<void> {
  try {
    const prodSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (!prodSnap.empty) {
      const batch1 = writeBatch(db);
      prodSnap.forEach((d) => batch1.delete(d.ref));
      await batch1.commit();
    }

    const bundleSnap = await getDocs(collection(db, COLLECTIONS.BUNDLES));
    if (!bundleSnap.empty) {
      const batch2 = writeBatch(db);
      bundleSnap.forEach((d) => batch2.delete(d.ref));
      await batch2.commit();
    }

    const orderSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));
    if (!orderSnap.empty) {
      const batch3 = writeBatch(db);
      orderSnap.forEach((d) => batch3.delete(d.ref));
      await batch3.commit();
    }
  } catch (err) {
    console.error('Failed to clear dummy catalog data from Firestore:', err);
  }
}

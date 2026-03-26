// src/app/core/services/firebase.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  writeBatch,
  Timestamp,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  QuerySnapshot,
  DocumentData,
  setDoc
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential
} from '@angular/fire/auth';
import { Observable, from, map, switchMap, of } from 'rxjs';

export interface BatchOperation {
  collection: string;
  id?: string;
  data: any;
  type: 'set' | 'update' | 'delete';
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(Auth);

  // ==================== FIRESTORE OPERATIONS ====================

  getCollection(collectionName: string, constraints: QueryConstraint[] = []): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = constraints.length ? query(collectionRef, ...constraints) : collectionRef;
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  getCollectionWithQuery(
    collectionName: string,
    field: string,
    operator: any,
    value: any,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc'
  ): Observable<any[]> {
    let constraints: QueryConstraint[] = [where(field, operator, value)];
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection || 'asc'));
    }
    return this.getCollection(collectionName, constraints);
  }

  getDocument(collectionName: string, id: string): Observable<any> {
    const docRef = doc(this.firestore, collectionName, id);
    return docData(docRef, { idField: 'id' }) as Observable<any>;
  }

  async getDocumentSnapshot(collectionName: string, id: string): Promise<any> {
    const docRef = doc(this.firestore, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  }

  async addDocument(collectionName: string, data: any): Promise<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async setDocument(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    await deleteDoc(docRef);
  }

  // Batch write operations - FIXED METHOD
  async batchWrite(operations: BatchOperation[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    for (const op of operations) {
      let docRef: DocumentReference;

      if (op.id) {
        docRef = doc(this.firestore, op.collection, op.id);
      } else {
        docRef = doc(collection(this.firestore, op.collection));
      }

      if (op.type === 'set') {
        batch.set(docRef, {
          ...op.data,
          updatedAt: Timestamp.now()
        });
      } else if (op.type === 'update') {
        if (!op.id) {
          throw new Error('Document ID is required for update operation');
        }
        batch.update(docRef, {
          ...op.data,
          updatedAt: Timestamp.now()
        });
      } else if (op.type === 'delete') {
        if (!op.id) {
          throw new Error('Document ID is required for delete operation');
        }
        batch.delete(docRef);
      }
    }

    await batch.commit();
  }

  // Query with multiple where clauses
  async queryCollection(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Generate sequential voucher number
  async generateVoucherNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counterRef = doc(this.firestore, 'counters', 'voucherNumber');

    try {
      const counterDoc = await getDoc(counterRef);
      let counter = 1;

      if (counterDoc.exists()) {
        counter = (counterDoc.data()?.['value'] || 0) + 1;
        await updateDoc(counterRef, { value: counter });
      } else {
        await setDoc(counterRef, { value: counter });
      }

      const sequence = String(counter).padStart(4, '0');
      return `${year}${month}-${sequence}`;
    } catch (error) {
      console.error('Error generating voucher number:', error);
      return `${year}${month}-${Date.now()}`;
    }
  }

  // ==================== STORAGE OPERATIONS ====================

  async uploadFile(path: string, file: File): Promise<string> {
    const filePath = `${path}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async uploadMultipleFiles(path: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(path, file));
    return await Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const storageRef = ref(this.storage, fileUrl);
    await deleteObject(storageRef);
  }

  // ==================== AUTHENTICATION OPERATIONS ====================

  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    return await signOut(this.auth);
  }

  getCurrentUser(): Observable<any> {
    return user(this.auth);
  }

  async createUser(email: string, password: string, displayName: string, role: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    // Store user role in Firestore
    await this.addDocument('users', {
      uid: userCredential.user.uid,
      email,
      displayName,
      role,
      isActive: true
    });

    return userCredential;
  }

  // ==================== HELPER METHODS ====================

  convertTimestampToDate(timestamp: Timestamp): Date {
    return timestamp?.toDate() || new Date();
  }

  convertDateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  // ==================== AGGREGATION METHODS ====================

  async getCount(collectionName: string, constraints: QueryConstraint[] = []): Promise<number> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = constraints.length ? query(collectionRef, ...constraints) : collectionRef;
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async getSum(collectionName: string, field: string, constraints: QueryConstraint[] = []): Promise<number> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = constraints.length ? query(collectionRef, ...constraints) : collectionRef;
    const snapshot = await getDocs(q);

    let sum = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      const value = data[field];
      if (typeof value === 'number') {
        sum += value;
      }
    });

    return sum;
  }

  // ==================== TRANSACTION OPERATIONS ====================

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    // Note: This is a simplified version. For full transaction support,
    // you'd need to use the Firestore runTransaction method
    return await updateFunction(null);
  }
}

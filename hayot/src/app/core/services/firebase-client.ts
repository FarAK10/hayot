import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import {
  Firestore,
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction, TransactionPayload } from '../models/transaction.models';
import { TransactionApi } from './transaction.api';

export class FirebaseClient implements TransactionApi {
  private readonly app: FirebaseApp = initializeApp(environment.firebase);
  private readonly auth: Auth = getAuth(this.app);
  private readonly db: Firestore = getFirestore(this.app);
  private user: Promise<string> | null = null;

  constructor() {
    if (environment.useEmulators) {
      connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.db, 'localhost', 8080);
    }
  }

  async create(payload: TransactionPayload): Promise<string> {
    const uid = await this.uid();
    const ref = await addDoc(collection(this.db, 'transactions'), {
      ...payload,
      uid,
      status: 'success',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  history(): Observable<Transaction[]> {
    return new Observable<Transaction[]>((subscriber) => {
      let unsubscribe = () => {};
      let closed = false;
      this.uid()
        .then((uid) => {
          if (closed) return;
          const q = query(
            collection(this.db, 'transactions'),
            where('uid', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(50),
          );
          unsubscribe = onSnapshot(
            q,
            (snap) =>
              subscriber.next(
                snap.docs.map((d) => {
                  const data = d.data({ serverTimestamps: 'estimate' });
                  return { ...data, id: d.id, createdAt: data['createdAt']?.toMillis() ?? Date.now() } as Transaction;
                }),
              ),
            (err) => subscriber.error(err),
          );
        })
        .catch((err) => subscriber.error(err));
      return () => {
        closed = true;
        unsubscribe();
      };
    });
  }

  /** Signs in anonymously on first use. */
  private uid(): Promise<string> {
    this.user ??= this.auth
      .authStateReady()
      .then(async () => this.auth.currentUser ?? (await signInAnonymously(this.auth)).user)
      .then((u) => u.uid)
      .catch((e) => {
        this.user = null;
        throw e;
      });
    return this.user;
  }
}

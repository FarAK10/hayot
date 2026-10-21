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
import { Observable, defer, from, map, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  HISTORY_LIMIT,
  TRANSACTIONS_COLLECTION,
} from '../config/app.config.constants';
import { PaymentStatus, Transaction, TransactionPayload } from '../models/transaction.models';
import { toTransaction } from '../utils/transaction.util';
import { TransactionApi } from './transaction.api';

export class FirebaseClient implements TransactionApi {
  private readonly app: FirebaseApp = initializeApp(environment.firebase);
  private readonly auth: Auth = getAuth(this.app);
  private readonly db: Firestore = getFirestore(this.app);

  private readonly uid$: Observable<string> = defer(() => from(this.auth.authStateReady())).pipe(
    switchMap(() => this.currentUser$()),
    map((user) => user.uid),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  constructor() {
    if (environment.useEmulators) {
      connectAuthEmulator(this.auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
        disableWarnings: true,
      });
      connectFirestoreEmulator(this.db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
    }
  }

  create(payload: TransactionPayload): Observable<string> {
    return this.uid$.pipe(
      switchMap((uid) =>
        from(
          addDoc(collection(this.db, TRANSACTIONS_COLLECTION), {
            ...payload,
            uid,
            status: PaymentStatus.Success,
            createdAt: serverTimestamp(),
          }),
        ),
      ),
      map((reference) => reference.id),
    );
  }

  history(): Observable<Transaction[]> {
    return this.uid$.pipe(switchMap((uid) => this.watchTransactions(uid)));
  }

  private currentUser$() {
    const signedIn = this.auth.currentUser;
    if (signedIn) {
      return of(signedIn);
    }
    return from(signInAnonymously(this.auth)).pipe(map((credential) => credential.user));
  }

  private watchTransactions(uid: string): Observable<Transaction[]> {
    return new Observable<Transaction[]>((subscriber) =>
      onSnapshot(
        this.userTransactionsQuery(uid),
        (snapshot) => subscriber.next(snapshot.docs.map(toTransaction)),
        (error) => subscriber.error(error),
      ),
    );
  }

  private userTransactionsQuery(uid: string) {
    return query(
      collection(this.db, TRANSACTIONS_COLLECTION),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(HISTORY_LIMIT),
    );
  }
}

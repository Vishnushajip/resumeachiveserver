import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase.service';
import dayjs from 'dayjs';
import * as admin from 'firebase-admin';
import * as jose from 'jose';
import { createHash } from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private encodeKey(value: string): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async trackTraffic(authHeader?: string, anonId?: string) {
    const db = this.firebaseService.getFirestore();

    const now = new Date();
    const today = dayjs().format('YYYY-MM-DD');

    let email: string | null = null;

    try {
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        const secret = new TextEncoder().encode(process.env.JOSE_SECRET);

        const key = await jose.importJWK({
          kty: 'oct',
          k: jose.base64url.encode(
            createHash('sha256').update(secret).digest(),
          ),
        });

        const { payload } = await jose.jwtDecrypt(token, key);

        email = payload.email as string;
      }
    } catch {
      email = null;
    }

    let userKey: string;

    if (email) {
      userKey = email;
    } else {
      userKey = anonId || `anon_${Math.random().toString(36).slice(2)}`;
    }

    const isAnonymous = userKey.startsWith('anon_');

    const safeKey = this.encodeKey(userKey);

    const ref = db.collection('daily_traffic').doc(today);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists) {
        tx.set(ref, {
          date: today,

          trafficCount: 1,

          uniqueUserCount: isAnonymous ? 0 : 1,
          anonymousCount: isAnonymous ? 1 : 0,

          userEmails: isAnonymous ? [] : [userKey],

          activeUsers: {
            [safeKey]: now,
          },

          lastUpdated: now,
        });

        return;
      }

      const data = snap.data() || {};

      const emails: string[] = data.userEmails || [];
      let uniqueUserCount = data.uniqueUserCount || 0;
      let anonymousCount = data.anonymousCount || 0;

      if (!isAnonymous) {
        if (!emails.includes(userKey)) {
          emails.push(userKey);
          uniqueUserCount++;
        }
      } else {
        anonymousCount++;
      }

      tx.update(ref, {
        trafficCount: admin.firestore.FieldValue.increment(1),

        uniqueUserCount,
        anonymousCount,
        userEmails: emails,

        [`activeUsers.${safeKey}`]: now,

        lastUpdated: now,
      });
    });

    return { success: true };
  }
}

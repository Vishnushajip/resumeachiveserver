import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;
  private storage: admin.storage.Storage;
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp();

        this.logger.log('Firebase initialized using ADC');
      }

      this.db = admin.firestore();
      this.storage = admin.storage();
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  getFirestore() {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }
    return this.db;
  }

  getStorage() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return this.storage;
  }

  getBucket() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return this.storage.bucket();
  }

  async saveAuthData(email: string, token: string) {
    try {
      await this.db.collection('auth_logs').add({
        email,
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error('Error saving auth data:', error);
    }
  }

  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(filePath);
      await file.save(fileBuffer, {
        contentType,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      await file.makePublic();
      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const bucket = this.getBucket();
      await bucket
        .file(filePath)
        .delete()
        .catch(() => {});
    } catch (error) {
      this.logger.error('Error deleting file:', error);
    }
  }

  async getSignedUrl(
    filePath: string,
    action: 'read' | 'write' | 'delete' = 'read',
    expiresInMinutes = 60,
  ): Promise<string> {
    try {
      const [url] = await this.getBucket()
        .file(filePath)
        .getSignedUrl({
          action,
          expires: Date.now() + expiresInMinutes * 60 * 1000,
        });
      return url;
    } catch (error) {
      this.logger.error('Error getting signed URL:', error);
      throw error;
    }
  }

  getPublicUrl(filePath: string): string {
    return `https://storage.googleapis.com/${this.getBucket().name}/${filePath}`;
  }

  extractFilePathFromUrl(url: string): string | null {
    const prefix = `https://storage.googleapis.com/${this.getBucket().name}/`;
    return url.startsWith(prefix) ? url.substring(prefix.length) : null;
  }
}

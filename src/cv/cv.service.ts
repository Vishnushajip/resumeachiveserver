import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../common/firebase.service';
import { CreateCvDto } from './dto/create-cv.dto';
import * as admin from 'firebase-admin';

export interface CvResponse {
  id: string;
  email: string;
  title: string;
  cvData: Record<string, any>;
  templateId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PaginatedCvResponse {
  data: CvResponse[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class CvService {
  constructor(private firebaseService: FirebaseService) {}

  async create(email: string, createCvDto: CreateCvDto): Promise<CvResponse> {
    const db = this.firebaseService.getFirestore();

    const cvData = {
      email,
      title: createCvDto.title,
      cvData: createCvDto.cvData,
      templateId: createCvDto.templateId || null,
      isActive: createCvDto.isActive ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('cvs').add(cvData);
    const doc = await docRef.get();
    const data = doc.data()!;

    return this.mapToCvResponse(doc.id, data);
  }

  async findAllByUser(
    email: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedCvResponse> {
    const db = this.firebaseService.getFirestore();
    const collection = db.collection('cvs');

    const countSnapshot = await collection
      .where('email', '==', email)
      .count()
      .get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;

    const snapshot = await collection
      .where('email', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const data: CvResponse[] = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return this.mapToCvResponse(doc.id, docData);
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  private mapToCvResponse(id: string, data: any): CvResponse {
    return {
      id,
      email: data.email,
      title: data.title,
      cvData: data.cvData,
      templateId: data.templateId,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate(),
    };
  }
  async findOne(id: string, email: string): Promise<CvResponse> {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('cvs').doc(id).get();

    if (!doc.exists) throw new NotFoundException('CV not found');
    if (doc.data()!.email !== email)
      throw new ForbiddenException('Access denied');

    return this.mapToCvResponse(doc.id, doc.data()!);
  }

  async update(
    id: string,
    email: string,
    updateData: Partial<CreateCvDto>,
  ): Promise<CvResponse> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('cvs').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('CV not found');
    if (doc.data()!.email !== email)
      throw new ForbiddenException('Access denied');

    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    return this.mapToCvResponse(updated.id, updated.data()!);
  }

  async remove(id: string, email: string): Promise<{ success: boolean }> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('cvs').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) throw new NotFoundException('CV not found');
    if (doc.data()!.email !== email)
      throw new ForbiddenException('Access denied');

    await docRef.delete();
    return { success: true };
  }

  async getDownloadUrl(id: string, email: string): Promise<{ url: string }> {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('cvs').doc(id).get();

    if (!doc.exists) throw new NotFoundException('CV not found');
    if (doc.data()!.email !== email)
      throw new ForbiddenException('Access denied');

    const storage = this.firebaseService.getStorage();
    const filePath = `cvs/${email}/${id}.pdf`;
    const file = storage.bucket().file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    });

    return { url };
  }
}

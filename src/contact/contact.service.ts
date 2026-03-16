import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase.service';
import { CreateContactDto } from './dto/create-contact.dto';
import * as admin from 'firebase-admin';

export interface ContactResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface PaginatedContactsResponse {
  data: ContactResponse[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class ContactService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<{ id: string; message: string }> {
    const db = this.firebaseService.getFirestore();

    const contactData = {
      ...createContactDto,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('contacts').add(contactData);

    return {
      id: docRef.id,
      message: 'Contact form submitted successfully',
    };
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedContactsResponse> {
    const db = this.firebaseService.getFirestore();
    const collection = db.collection('contacts');

    const countSnapshot = await collection.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;

    const snapshot = await collection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const data: ContactResponse[] = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        firstName: docData.firstName,
        lastName: docData.lastName,
        email: docData.email,
        mobile: docData.mobile,
        subject: docData.subject,
        message: docData.message,
        createdAt: docData.createdAt?.toDate(),
      };
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
}

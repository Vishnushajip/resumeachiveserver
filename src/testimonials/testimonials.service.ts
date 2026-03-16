import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../common/firebase.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import * as admin from 'firebase-admin';

export interface TestimonialResponse {
  id: string;
  name: string;
  designation: string;
  feedback: string;
  rating: number;
  email?: string;
  isApproved: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTestimonialsResponse {
  data: TestimonialResponse[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class TestimonialsService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    createTestimonialDto: CreateTestimonialDto,
  ): Promise<TestimonialResponse> {
    const db = this.firebaseService.getFirestore();

    const testimonialData = {
      ...createTestimonialDto,
      isApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('testimonials').add(testimonialData);
    const doc = await docRef.get();
    const data = doc.data();

    return this.mapToTestimonialResponse(doc.id, data);
  }

  async findAllApproved(
    page = 1,
    limit = 10,
  ): Promise<PaginatedTestimonialsResponse> {
    const db = this.firebaseService.getFirestore();
    const collection = db.collection('testimonials');

    const countSnapshot = await collection
      .where('isApproved', '==', true)
      .count()
      .get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;

    const snapshot = await collection
      .where('isApproved', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const data: TestimonialResponse[] = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return this.mapToTestimonialResponse(doc.id, docData);
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

  async findAll(page = 1, limit = 10): Promise<PaginatedTestimonialsResponse> {
    const db = this.firebaseService.getFirestore();
    const collection = db.collection('testimonials');

    const countSnapshot = await collection.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;

    const snapshot = await collection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const data: TestimonialResponse[] = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return this.mapToTestimonialResponse(doc.id, docData);
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

  async findOne(id: string): Promise<TestimonialResponse> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('testimonials').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.mapToTestimonialResponse(doc.id, doc.data());
  }

  async update(
    id: string,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<TestimonialResponse> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('testimonials').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Testimonial not found');
    }

    const updateData = {
      ...updateTestimonialDto,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return this.mapToTestimonialResponse(updatedDoc.id, updatedDoc.data());
  }

  async remove(id: string): Promise<{ message: string }> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('testimonials').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Testimonial not found');
    }

    await docRef.delete();

    return { message: 'Testimonial deleted successfully' };
  }

  async approve(id: string): Promise<TestimonialResponse> {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('testimonials').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Testimonial not found');
    }

    await docRef.update({
      isApproved: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await docRef.get();
    return this.mapToTestimonialResponse(updatedDoc.id, updatedDoc.data());
  }

  private mapToTestimonialResponse(id: string, data: any): TestimonialResponse {
    return {
      id,
      name: data.name,
      designation: data.designation,
      feedback: data.feedback,
      rating: data.rating,
      email: data.email,
      isApproved: data.isApproved,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }
}

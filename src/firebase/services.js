// AMCONNECTB2B Admin · Firestore service layer
//
// All reads/writes used by the admin panel funnel through this file so the
// rest of the app deals with plain JS objects.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit,
} from 'firebase/firestore'
import { db } from './config.js'

/* ──────────────────────────────────────────────────────────── Site settings */

export const defaultSiteSettings = {
  theme: 'blue',
  features: {
    showTestimonials: true,
    showCaseStudies: true,
    showStats: true,
    showResources: true,
    showLogoCloud: true,
    showLiveChat: false,
    enableContactForm: true,
    showAnnouncement: true,
  },
  announcement: {
    text: 'Now accepting new B2B engagements for Q3.',
    href: '/contact',
  },
  contact: {
    email: 'hello@amconnectb2b.com',
    phone: '',
    address:
      'Bunglow No 7, S.No. 181, General Kariappa Rd, Khadki, Pune 411003, Maharashtra, India',
  },
}

export async function getSiteSettings() {
  const ref = doc(db, 'settings', 'site')
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    // Initialise with defaults so the editor has something to edit
    await setDoc(ref, defaultSiteSettings)
    return defaultSiteSettings
  }
  return { ...defaultSiteSettings, ...snap.data() }
}

export async function saveSiteSettings(values) {
  const ref = doc(db, 'settings', 'site')
  await setDoc(ref, values, { merge: true })
}

/* ─────────────────────────────────────────────── Custom services / solutions */

export async function listServices() {
  const q = query(collection(db, 'services'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getService(id) {
  const snap = await getDoc(doc(db, 'services', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createService(payload) {
  const ref = await addDoc(collection(db, 'services'), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateService(id, payload) {
  await updateDoc(doc(db, 'services', id), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id))
}

/* ────────────────────────────────────────────────────────── Testimonials CRUD */

export async function listTestimonials() {
  const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createTestimonial(payload) {
  const ref = await addDoc(collection(db, 'testimonials'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTestimonial(id, payload) {
  await updateDoc(doc(db, 'testimonials', id), payload)
}

export async function deleteTestimonial(id) {
  await deleteDoc(doc(db, 'testimonials', id))
}

/* ────────────────────────────────────────────────────────── Case studies CRUD */

export async function listCaseStudies() {
  const q = query(collection(db, 'caseStudies'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createCaseStudy(payload) {
  const ref = await addDoc(collection(db, 'caseStudies'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCaseStudy(id, payload) {
  await updateDoc(doc(db, 'caseStudies', id), payload)
}

export async function deleteCaseStudy(id) {
  await deleteDoc(doc(db, 'caseStudies', id))
}

/* ─────────────────────────────────────────────────── Contact submissions list */

export async function listContactSubmissions(max = 200) {
  const q = query(
    collection(db, 'contactSubmissions'),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markSubmissionStatus(id, status) {
  await updateDoc(doc(db, 'contactSubmissions', id), {
    status,
    statusUpdatedAt: serverTimestamp(),
  })
}

export async function deleteSubmission(id) {
  await deleteDoc(doc(db, 'contactSubmissions', id))
}

/* ──────────────────────────────────────────────────── Admin users management */

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
}

export async function listAdminUsers() {
  const q = query(collection(db, 'adminUsers'), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getAdminUser(uid) {
  const snap = await getDoc(doc(db, 'adminUsers', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAdminUserByEmail(email) {
  const q = query(collection(db, 'adminUsers'), where('email', '==', email), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function createAdminUser(uid, payload) {
  await setDoc(doc(db, 'adminUsers', uid), {
    ...payload,
    createdAt: serverTimestamp(),
  })
}

export async function updateAdminUser(uid, payload) {
  await updateDoc(doc(db, 'adminUsers', uid), payload)
}

export async function deleteAdminUser(uid) {
  await deleteDoc(doc(db, 'adminUsers', uid))
}

/* ──────────────────────────────────────────────────────────────── Dashboard */

export async function getDashboardCounts() {
  const [submissions, services, testimonials, caseStudies] = await Promise.all([
    getDocs(collection(db, 'contactSubmissions')),
    getDocs(collection(db, 'services')),
    getDocs(collection(db, 'testimonials')),
    getDocs(collection(db, 'caseStudies')),
  ])
  const subs = submissions.docs.map((d) => d.data())
  const newCount = subs.filter((s) => s.status === 'new' || !s.status).length
  return {
    totalSubmissions: subs.length,
    newSubmissions: newCount,
    services: services.size,
    testimonials: testimonials.size,
    caseStudies: caseStudies.size,
  }
}

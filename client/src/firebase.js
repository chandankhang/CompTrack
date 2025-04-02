import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import multer from 'multer';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const upload = multer({ storage: multer.memoryStorage() });

export const uploadToFirebase = upload;

export const uploadFile = async (file) => {
  const storageRef = ref(storage, `complaints/${Date.now()}_${file.originalname}`);
  await uploadBytes(storageRef, file.buffer);
  const url = await getDownloadURL(storageRef);
  return url;
};

export default async (req, res, next) => {
  if (!req.file) return next();
  try {
    const firebaseUrl = await uploadFile(req.file);
    req.file.firebaseUrl = firebaseUrl;
    next();
  } catch (error) {
    res.status(500).json({ message: `Image upload failed: ${error.message}` });
  }
};
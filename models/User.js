// models/User.js
import mongoose from 'mongoose';

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST;

let UserModel;

if (isTestEnv) {
  const usersById = new Map();
  const usersByEmail = new Map();

  const normalizeEmail = (email) => email?.toLowerCase() ?? '';

  const cloneDoc = (doc) => {
    if (!doc) {
      return null;
    }
    return { ...doc, save: doc.save };
  };

  const applySelect = (doc, select) => {
    if (!doc) {
      return null;
    }
    const cloned = cloneDoc(doc);
    if (!select) {
      return cloned;
    }
    const trimmed = select.trim();
    if (trimmed.startsWith('-')) {
      const field = trimmed.slice(1);
      delete cloned[field];
    }
    return cloned;
  };

  const wrapSelectable = (doc) => {
    const promise = Promise.resolve(doc);
    return {
      select: (select) =>
        promise.then((resolvedDoc) => applySelect(resolvedDoc, select)),
      then: (...args) => promise.then(...args),
      catch: (...args) => promise.catch(...args),
      finally: (...args) => promise.finally(...args),
    };
  };

  const createDoc = (data) => {
    const now = new Date();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      email: normalizeEmail(data.email),
      password: data.password,
      role: data.role ?? 'user',
      status: data.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      save: async function save() {
        this.updatedAt = new Date();
        const id = this._id.toString();
        usersById.set(id, this);
        usersByEmail.set(normalizeEmail(this.email), this);
        return this;
      },
    };
    return doc;
  };

  const findOne = (query) => {
    if (!query) {
      return null;
    }
    if (query.email) {
      return usersByEmail.get(normalizeEmail(query.email)) ?? null;
    }
    return null;
  };

  const findById = (id) => {
    if (!id) {
      return null;
    }
    const key = id.toString();
    return usersById.get(key) ?? null;
  };

  UserModel = {
    create: async (data) => {
      const emailKey = normalizeEmail(data.email);
      if (usersByEmail.has(emailKey)) {
        const error = new Error('Duplicate email');
        error.code = 11000;
        throw error;
      }
      const doc = createDoc(data);
      await doc.save();
      return doc;
    },
    findOne: (query) => wrapSelectable(findOne(query)),
    findById: (id) => wrapSelectable(findById(id)),
    deleteMany: async () => {
      usersById.clear();
      usersByEmail.clear();
    },
  };
} else {
  const userSchema = new mongoose.Schema(
    {
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 100,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        maxlength: 100,
        select: false,
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
    },
    { timestamps: true },
  );

  // Отключаем автоматическую установку уникальности на password,
  // т.к. она не нужна и мешает (если была добавлена раньше)
  delete userSchema.paths.password.options.unique;

  UserModel = mongoose.model('User', userSchema);
}

export default UserModel;

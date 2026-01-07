import type { User } from './db';
import { db } from './db';

export async function createUser(u: Omit<User, 'id'>) {
  return db.users.add({
    ...u,
    createdAt: Date.now(),
  });
}

export async function findUser(username: string, password: string) {
  return db.users.where({ username, password }).first();
}

export async function emailExists(email: string) {
  return db.users.where('email').equals(email).first();
}

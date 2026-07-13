export type UserRole = "admin" | "manager" | "staff" | "cashier";

export interface AuthUser { id: number; username: string; role: UserRole; }
export interface LoginInput { username: string; password: string; }
export interface ChangePasswordInput { userId: number; currentPassword: string; newPassword: string; }
export interface UserRow { id: number; username: string; role: UserRole; isActive: number; createdAt: string; }
export interface CreateUserInput { username: string; password: string; role: UserRole; }
export interface UpdateUserInput { id: number; username?: string; role?: UserRole; isActive?: boolean; }
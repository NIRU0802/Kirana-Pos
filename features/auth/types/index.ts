export interface AuthUser { id: number; username: string; role: "admin" | "cashier" | "manager"; }
export interface LoginInput { username: string; password: string; }
export interface ChangePasswordInput { userId: number; currentPassword: string; newPassword: string; }

"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const SignupSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự.").trim(),
  email: z.string().email("Email không hợp lệ.").trim(),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .regex(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái.")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số."),
});

const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ.").trim(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
} | undefined;

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signupAction(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // Check email đã tồn tại chưa
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    return { errors: { email: ["Email này đã được sử dụng."] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
  } catch {
    return { message: "Đã có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại." };
  }

  // Tự động đăng nhập sau khi đăng ký
  await signIn("credentials", { email, password, redirectTo: "/" });
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function loginAction(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email hoặc mật khẩu không đúng." };
        default:
          return { message: "Đã có lỗi xảy ra. Vui lòng thử lại." };
      }
    }
    throw error; // Re-throw redirect
  }
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signoutAction() {
  await signOut({ redirectTo: "/" });
}

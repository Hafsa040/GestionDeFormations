// src/app/actions/login.ts
"use server";
import { signIn } from "@/lib/auth"; 
import { AuthError } from "next-auth";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false , 
    });
return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides." };
        default:
          return { error: "Une erreur est survenue." };
      }
    }
    throw error;
  }
}
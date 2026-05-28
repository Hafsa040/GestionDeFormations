"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  console.log("--- TEST DE CONNEXION ---");
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return { 
      error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial." 
    };
  }
  try {
    const count = await prisma.user.count();
    console.log("Connexion réussie ! Nombre d'utilisateurs actuels :", count);
  } catch (err) {
    console.error("ÉCHEC DE CONNEXION À LA BASE :");
    console.error(err);
    return { error: "La base de données ne répond pas." };
  } 

  const defaultRole = "ETUDIANT";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Cet email est déjà utilisé." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: defaultRole, 
      },
    });
  } catch (error) {
    return { error: "Erreur lors de la création du compte." };
  }

  redirect("/login");
}
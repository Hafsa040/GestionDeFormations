"use server";

import { prisma } from "@/lib/prisma";

export async function getMessages() {
  try {
    const messages = await prisma.message.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        parentMessage: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: 50 
    });

    return messages;
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    return [];
  }
}

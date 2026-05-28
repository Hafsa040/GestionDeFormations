import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { content, type, fileUrl, parentMessageId } = body;

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        fileUrl,
        userId: session.user.id,
        parentMessageId: parentMessageId || null, // C'est ici que le Reply se lie
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        },
        parentMessage: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Erreur API Message:", error);
    return new NextResponse("Erreur Interne", { status: 500 });
  }
}
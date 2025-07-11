import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    console.log("POST request:", request);
    const sessionData = await auth.api.getSession({
        headers: await headers()
    });

    if (!sessionData?.session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    try {
        const user = await prisma.user.update({
            where: { id: sessionData.user.id },
            data: {
                extraData: data
            },
        });

        if (user) {
            return NextResponse.json({ ...user.extraData }, { status: 200 });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
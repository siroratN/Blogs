import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'token';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}


export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}


export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

//Generate a JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET_KEY);
}

// Verify a JWT token and return the payload 
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

//Get authenticated user from Server Component
export async function getAuthUser(): Promise<JWTPayload | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get(COOKIE_NAME);
        if (!tokenCookie || !tokenCookie.value) {
            return null;
        }
        return await verifyToken(tokenCookie.value);
    } catch {
        return null;
    }
}

//set httpOnly auth cookie in responses
export async function setAuthCookie(token: string) {
    const maxAge = 7 * 24 * 60 * 60; // 7 วัน
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
    });
}

//clear auth cookie on logout
export async function deleteAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

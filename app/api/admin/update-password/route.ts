import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { userId, newPassword } = await request.json();

        // Validasi input dasar
        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: 'User ID dan Password baru wajib diisi.' },
                { status: 400 }
            );
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            console.error('Supabase Auth Admin Error:', error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Password berhasil diperbarui',
            user: data.user.email 
        });

    } catch (error: any) {
        console.error('Server Internal Error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan pada server: ' + error.message },
            { status: 500 }
        );
    }
}
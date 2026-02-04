// app/api/admin/create-user/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, nama_lengkap, nip, role, ttd_barcode } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        nama_lengkap,
        nip,
        role,
        ttd_barcode: ttd_barcode
      },
      email_confirm: true
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        nama_lengkap,
        nip,
        email,
        role,
        ttd_barcode: ttd_barcode
      }, { onConflict: 'id' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User berhasil dibuat' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
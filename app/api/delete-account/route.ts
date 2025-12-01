import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    // 1. Get the access token sent from the client
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    // 2. Setup the Admin Client (Privileged)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_ENIGMA_AUTH_URL!,
      process.env.ENIGMA_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Verify the user using the token to get their ID
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 4. DELETE the user from the database
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

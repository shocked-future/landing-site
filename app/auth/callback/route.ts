//import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
//import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // Note: For the AUTH project specifically
    // This part handles the server-side exchange if you were using the auth-helpers package.
    // However, since we built a pure Client-Side flow for "Enigma" (to keep projects separate),
    // Supabase's client SDK usually handles the fragment automatically on the client side.
    // BUT, usually for OAuth, Supabase redirects to this URL.

    // If you are strictly using client-side "enigmaAuth", you just need to
    // redirect the user back to the client page, and the client-side onAuthStateChange
    // in AuthContext will pick up the session from the URL fragment/hash.

    return NextResponse.redirect(`${requestUrl.origin}/profile`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/`);
}

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Skip auth checks if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  // Original Supabase SSR pattern — MUST keep setAll updating request.cookies
  // so that refreshed tokens are visible to server components in the same request.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          // Update request.cookies so downstream server components see the refreshed token
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Recreate the response with the mutated request so Next.js propagates cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/api");

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/journal", request.url));
  }

  if (user) {
    // Rebuild request headers with x-user-id so server components can skip getUser().
    // At this point request.cookies may have been updated by setAll (token refresh),
    // so new Headers(request.headers) picks up the refreshed cookie header too.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);

    const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });

    // Transfer any response cookies (refreshed tokens) to the final response
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      finalResponse.cookies.set(
        name,
        value,
        options as Parameters<typeof finalResponse.cookies.set>[2]
      );
    });

    return finalResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

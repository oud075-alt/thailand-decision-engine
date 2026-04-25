// API route handler for comments on the Echoes of Thailand site.
//
// This endpoint handles both fetching comments (GET) and posting new
// comments (POST) for the decision tool and blog posts. It integrates
// with Supabase tables `public_comments` and `post_comments` respectively.
// The POST handler includes validation to ensure that each comment is
// accompanied by a valid email address. Comments without a valid email
// will be rejected with a 400 response.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables. Service role key
// is required to insert data into protected tables. Ensure these variables
// are set in the deployment environment.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

// Validate an email address using a simple regex. Trims and lowercases
// input before testing. Returns true if the email appears well‑formed.
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

// GET handler: return all comments from both public and post tables.
export async function GET() {
  try {
    // Fetch public (decision tool) comments ordered by newest first.
    const { data: publicComments, error: publicError } = await supabase
      .from("public_comments")
      .select("id, province, email, comment, created_at")
      .order("created_at", { ascending: false });
    if (publicError) {
      console.error("SUPABASE_ERROR_PUBLIC_COMMENTS:", publicError);
      return NextResponse.json(
        { error: "Failed to fetch public comments" },
        { status: 500 }
      );
    }

    // Fetch post comments ordered by newest first.
    const { data: postComments, error: postError } = await supabase
      .from("post_comments")
      .select("id, post_id, email, comment, created_at")
      .order("created_at", { ascending: false });
    if (postError) {
      console.error("SUPABASE_ERROR_POST_COMMENTS:", postError);
      return NextResponse.json(
        { error: "Failed to fetch post comments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publicComments: publicComments || [],
      postComments: postComments || [],
    });
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);
    return NextResponse.json(
      { error: "Could not fetch comments data" },
      { status: 500 }
    );
  }
}

// POST handler: insert a new comment into the appropriate table. Requires
// a valid email and comment. The body may contain a `province` (for
// decision tool comments) or a `post_id` (for post comments).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const province =
      typeof body.province === "string" ? body.province.trim() : "";
    const postId =
      typeof body.post_id === "string" ? body.post_id.trim() : "";
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    // Require a non‑empty comment.
    if (!comment) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }
    // Require a valid email.
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required before commenting" },
        { status: 400 }
      );
    }

    // Insert into the appropriate table based on whether postId is present.
    if (postId) {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        email,
        comment,
      });
      if (error) {
        console.error("POST_COMMENT_INSERT_ERROR:", error);
        return NextResponse.json(
          { error: error.message || "Could not post comment" },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Otherwise treat as a public comment.
    const { error } = await supabase.from("public_comments").insert({
      province: province || null,
      email,
      comment,
    });
    if (error) {
      console.error("PUBLIC_COMMENT_INSERT_ERROR:", error);
      return NextResponse.json(
        { error: error.message || "Could not send comment" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("COMMENT_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Could not send comment" },
      { status: 500 }
    );
  }
}
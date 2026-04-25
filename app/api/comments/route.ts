import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId", comments: [] },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("post_comments")
      .select("id, post_id, comment, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message, comments: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comments: data || [],
    });
  } catch (error) {
    console.error("COMMENTS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load comments", comments: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Please login with your email before commenting." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user?.id || !user.email) {
      return NextResponse.json(
        { error: "Invalid login session. Please login again." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const postId =
      typeof body.post_id === "string" ? body.post_id.trim() : "";

    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    if (!postId || !comment) {
      return NextResponse.json(
        { error: "Missing post_id or comment" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("post_comments")
      .insert([
        {
          post_id: postId,
          comment,
          user_id: user.id,
          user_email: user.email,
        },
      ])
      .select("id, post_id, comment, created_at, user_id, user_email")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: data,
    });
  } catch (error) {
    console.error("COMMENTS_POST_ERROR:", error);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, adminSecret } = body;

    // Simple admin check
    const expectedSecret = process.env.ADMIN_SECRET || "admin123";
    if (adminSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Comment id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("DELETE_COMMENT_ERROR:", error);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

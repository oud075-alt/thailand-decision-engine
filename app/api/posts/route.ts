import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";
const supabase = getSupabaseAdmin();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, image_url, type } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("posts").insert([
  {
    title,
    content,
    image_url: image_url || "",
    type: type === "advisory" ? "advisory" : "content",
  },
]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
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
        { error: "Post id is required" },
        { status: 400 }
      );
    }

    // Delete associated comments first
    await supabase.from("post_comments").delete().eq("post_id", id);

    // Delete the post
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, serviceRoleKey);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const province = searchParams.get("province");

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("public_comments")
      .select("id, province, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (province) {
      query = query.eq("province", province);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      comments: data || [],
    });
  } catch (error: any) {
    console.error("COMMENTS_GET_ERROR:", error);

    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const province =
      typeof body?.province === "string" ? body.province.trim() : "";
    const comment =
      typeof body?.comment === "string" ? body.comment.trim() : "";

    if (!comment) {
      return Response.json(
        { error: "Comment is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("public_comments")
      .insert({
        province: province || null,
        comment,
      })
      .select("id, province, comment, created_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      comment: data,
    });
  } catch (error: any) {
    console.error("COMMENTS_POST_ERROR:", error);

    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
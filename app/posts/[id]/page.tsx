import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

type Post = {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
};

async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Post;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-black px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {post.image_url && (
          <div className="mb-6">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
          {post.title}
        </h1>

        {post.created_at && (
          <p className="text-sm text-black/50 mb-6">
            {new Date(post.created_at).toLocaleString()}
          </p>
        )}

        <article className="text-base md:text-lg leading-8 whitespace-pre-wrap text-black/80">
          {post.content}
        </article>

        <div className="mt-10">
          <a
            href="/content"
            className="inline-block text-sm text-black/60 hover:text-black underline"
          >
            ← Back to posts
          </a>
        </div>
      </div>
    </main>
  );
}
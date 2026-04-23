import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/server";

const MAX_COMMENT_LENGTH = 280;

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
};

function cleanComment(input: unknown) {
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/\s+/g, " ").trim().slice(0, MAX_COMMENT_LENGTH);
}

function tableMissingResponse() {
  return NextResponse.json(
    {
      error:
        "The comments table is not ready yet. Run supabase/schema.sql in the Supabase SQL editor.",
      code: "COMMENTS_TABLE_MISSING",
    },
    { status: 503 },
  );
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === "42P01" || error.message.includes("comments")) {
      return tableMissingResponse();
    }

    return NextResponse.json(
      { error: "Could not load comments." },
      { status: 500 },
    );
  }

  return NextResponse.json({ comments: (data ?? []) as CommentRow[] });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const body = cleanComment(payload?.body);

  if (!body) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({ body })
    .select("id, body, created_at")
    .single();

  if (error) {
    if (error.code === "42P01" || error.message.includes("comments")) {
      return tableMissingResponse();
    }

    return NextResponse.json(
      { error: "Could not save comment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ comment: data as CommentRow }, { status: 201 });
}

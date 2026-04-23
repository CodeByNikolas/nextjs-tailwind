"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Comment = {
  id: string;
  body: string;
  created_at: string;
};

type CommentsResponse = {
  comments?: Comment[];
  comment?: Comment;
  error?: string;
  code?: string;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CommentWall() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Loading comments...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = useMemo(() => 280 - draft.length, [draft]);

  useEffect(() => {
    let isActive = true;

    fetch("/api/comments", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as CommentsResponse;
        return { payload, response };
      })
      .then(({ payload, response }) => {
        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setStatus(payload.error ?? "Could not load comments.");
          return;
        }

        setComments(payload.comments ?? []);
        setStatus("");
      })
      .catch(() => {
        if (isActive) {
          setStatus("Could not load comments.");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = draft.trim();
    if (!body) {
      setStatus("Write a comment first.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Posting...");

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const payload = (await response.json()) as CommentsResponse;

    setIsSubmitting(false);

    if (!response.ok || !payload.comment) {
      setStatus(payload.error ?? "Could not post comment.");
      return;
    }

    setDraft("");
    setComments((current) => [payload.comment!, ...current]);
    setStatus("Comment posted.");
  }

  return (
    <section className="comment-panel w-full max-w-3xl border border-white/14 bg-black/35 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-1 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-200/80">
            Public comment stream
          </p>
          <h2 className="text-2xl font-black text-white">Leave your mark</h2>
        </div>
        <p className="text-sm text-cyan-100/70">{comments.length} visible</p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="comment">
          Comment
        </label>
        <textarea
          id="comment"
          className="min-h-24 resize-none border border-white/12 bg-white/10 p-4 text-base text-white outline-none transition focus:border-cyan-200/80 focus:bg-white/14"
          maxLength={280}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Post a comment for everyone..."
          value={draft}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cyan-100/70">{remaining} characters left</p>
          <button
            className="border border-cyan-200/50 bg-cyan-200 px-5 py-3 text-sm font-black uppercase text-black shadow-[0_0_30px_rgba(103,232,249,0.34)] transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Posting" : "Post comment"}
          </button>
        </div>
      </form>

      {status ? <p className="mt-4 text-sm text-emerald-100/80">{status}</p> : null}

      <div className="mt-6 grid gap-3">
        {comments.length === 0 && !status ? (
          <p className="border border-dashed border-white/16 p-4 text-sm text-cyan-100/70">
            No comments yet. Be the first one.
          </p>
        ) : null}

        {comments.map((comment) => (
          <article
            className="border border-white/10 bg-white/[0.07] p-4 text-left"
            key={comment.id}
          >
            <p className="break-words text-base font-semibold text-white">
              {comment.body}
            </p>
            <time
              className="mt-2 block text-xs font-bold uppercase text-emerald-200/70"
              dateTime={comment.created_at}
            >
              {dateFormatter.format(new Date(comment.created_at))}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}

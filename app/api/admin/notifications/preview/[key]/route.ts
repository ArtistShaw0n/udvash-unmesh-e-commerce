import { NextRequest, NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { getTemplate } from "@/lib/server/email-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications/preview/[key]?format=html|text
 *
 * Returns the rendered template body (HTML by default, plain text on
 * `?format=text`). The admin preview page mounts these URLs inside an
 * iframe so each template renders in its own document — exactly how
 * the recipient's mail client would render it.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }

  const { key } = await params;
  const tpl = getTemplate(key);
  if (!tpl) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const rendered = tpl.render();
  const format = req.nextUrl.searchParams.get("format");

  if (format === "text") {
    return new NextResponse(rendered.text, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (format === "json") {
    return NextResponse.json({
      key: tpl.key,
      label: tpl.label,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }

  return new NextResponse(rendered.html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Prevent iframe blocking by same-origin policy in dev
      "x-frame-options": "SAMEORIGIN",
    },
  });
}

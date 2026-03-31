import { NextRequest } from "next/server";

const FORWARDED_HEADERS = [
  "accept-ranges",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
] as const;

function getAllowedS3Hosts(): Set<string> {
  const allowedHosts = new Set<string>();
  const rawEndpoints = [process.env.S3_PUBLIC_ENDPOINT, process.env.S3_ENDPOINT];

  for (const endpoint of rawEndpoints) {
    if (!endpoint) {
      continue;
    }

    try {
      allowedHosts.add(new URL(endpoint).host);
    } catch {
      // Ignore invalid endpoint values and continue with other entries.
    }
  }

  return allowedHosts;
}

function buildUpstreamRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const range = request.headers.get("range");

  if (range) {
    headers.set("range", range);
  }

  return headers;
}

async function proxyFile(request: NextRequest): Promise<Response> {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return Response.json({ error: "Missing url query parameter" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return Response.json({ error: "Invalid url query parameter" }, { status: 400 });
  }

  if (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") {
    return Response.json({ error: "Unsupported URL protocol" }, { status: 400 });
  }

  const allowedHosts = getAllowedS3Hosts();
  if (!allowedHosts.has(targetUrl.host)) {
    return Response.json({ error: "Host is not allowed" }, { status: 403 });
  }

  const upstreamResponse = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: buildUpstreamRequestHeaders(request),
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const headerName of FORWARDED_HEADERS) {
    const headerValue = upstreamResponse.headers.get(headerName);
    if (headerValue) {
      responseHeaders.set(headerName, headerValue);
    }
  }

  responseHeaders.set("cache-control", "private, no-store");

  return new Response(request.method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return proxyFile(request);
}

export async function HEAD(request: NextRequest): Promise<Response> {
  return proxyFile(request);
}

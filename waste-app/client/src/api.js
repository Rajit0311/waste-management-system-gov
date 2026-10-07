export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const isForm = body instanceof FormData;
  const res = await fetch("/api" + path, {
    method,
    headers: { ...(token && { Authorization: "Bearer " + token }), ...(body && !isForm && { "Content-Type": "application/json" }) },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 4 && email.includes("@");
}

export function validateRedirect(
  toUrl: FormDataEntryValue | string | null,
  url: string = "/"
) {
  if (!toUrl || typeof toUrl !== "string") {
    return url;
  }
  return toUrl;
}

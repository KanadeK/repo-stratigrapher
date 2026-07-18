const EMAIL_PATTERN = /([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})/gi;
const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  /github_pat_[A-Za-z0-9_]{40,}/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
];

export function maskEmail(value: string): string {
  return value.replace(
    EMAIL_PATTERN,
    (_match, name: string, domain: string) => {
      const visible =
        name.length <= 2 ? `${name[0] ?? "x"}*` : `${name.slice(0, 2)}***`;
      return `${visible}@${domain.toLowerCase()}`;
    },
  );
}

export function redactSecrets(value: string): string {
  return SECRET_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "[redacted-secret]"),
    value,
  );
}

export function sanitizeText(value: string, maskEmails: boolean): string {
  const redacted = redactSecrets(value);
  return maskEmails ? maskEmail(redacted) : redacted;
}

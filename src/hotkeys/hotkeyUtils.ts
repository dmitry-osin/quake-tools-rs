export function normalizeHotkeyInput(raw: string): string {
  const value = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!value) {
    return "";
  }

  const parts = value.split("+").filter(Boolean);
  const modifiers = new Set<string>();
  let key = "";

  for (const part of parts) {
    if (part === "CTRL" || part === "ALT" || part === "SHIFT") {
      modifiers.add(part);
      continue;
    }

    key = part;
  }

  const orderedModifiers = ["CTRL", "ALT", "SHIFT"].filter((entry) => modifiers.has(entry));
  if (!key) {
    return orderedModifiers.join("+");
  }

  return [...orderedModifiers, key].join("+");
}

function isFunctionKey(key: string): boolean {
  return /^F([1-9]|1[0-2])$/.test(key);
}

function isSingleKey(key: string): boolean {
  return /^[A-Z0-9]$/.test(key) || isFunctionKey(key);
}

export function isValidHotkey(hotkey: string): boolean {
  const normalized = normalizeHotkeyInput(hotkey);
  if (!normalized) {
    return false;
  }

  const parts = normalized.split("+");
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  if (!isSingleKey(key)) {
    return false;
  }

  if (modifiers.length === 0) {
    return true;
  }

  return modifiers.every((entry) => entry === "CTRL" || entry === "ALT" || entry === "SHIFT");
}

export function eventToHotkey(event: KeyboardEvent): string {
  const rawKey = event.key.toUpperCase();
  const key = rawKey === " " ? "SPACE" : rawKey;

  if (!isSingleKey(key)) {
    return "";
  }

  const parts: string[] = [];
  if (event.ctrlKey) {
    parts.push("CTRL");
  }
  if (event.altKey) {
    parts.push("ALT");
  }
  if (event.shiftKey) {
    parts.push("SHIFT");
  }
  parts.push(key);

  return normalizeHotkeyInput(parts.join("+"));
}

export function toPluginHotkey(hotkey: string): string {
  return normalizeHotkeyInput(hotkey)
    .replace(/CTRL/g, "Control")
    .replace(/ALT/g, "Alt")
    .replace(/SHIFT/g, "Shift");
}

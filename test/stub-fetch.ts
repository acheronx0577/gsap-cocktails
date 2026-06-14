export function stubFetch(response: Response) {
  const captured = { url: "", init: undefined as RequestInit | undefined };
  const original = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    captured.url = String(input);
    captured.init = init;
    return response;
  };

  return {
    captured,
    restore() {
      globalThis.fetch = original;
    },
  };
}

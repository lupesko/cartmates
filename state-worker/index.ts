import type { StateEnv } from "./env";

export { SharedList } from "./shared-list";

export default {
  fetch(): Response {
    return new Response(null, {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
} satisfies ExportedHandler<StateEnv>;

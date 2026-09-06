// ============================================================
// GLOBAL INSTRUMENTATION & PROCESS ERROR HANDLER
// Prevents Node.js server crashes from unhandledRejection / uncaughtException
// ============================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("[Process Guard] Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (error: Error) => {
      console.error("[Process Guard] Uncaught Exception caught:", error);
    });

    console.log("[Instrumentation] Global process error handlers registered successfully.");
  }
}

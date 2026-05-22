import { describe, it, expect } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as configHandler from "@/app/api/config/route";

describe("配置 API", () => {
  it("GET /api/config 返回模型配置", async () => {
    await testApiHandler({
      appHandler: configHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.model).toBeDefined();
        expect(typeof json.model).toBe("string");
      },
    });
  });
});

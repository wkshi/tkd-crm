import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() 工具函数", () => {
  it("合并多个类名字符串", () => {
    const result = cn("base-class", "extra-class");
    expect(result).toBe("base-class extra-class");
  });

  it("处理条件类名", () => {
    const isActive = true;
    const result = cn("btn", isActive && "btn-active");
    expect(result).toBe("btn btn-active");
  });

  it("过滤 falsy 值", () => {
    const result = cn("btn", false && "hidden", null, undefined, "visible");
    expect(result).toBe("btn visible");
  });

  it("合并 Tailwind 冲突类名（后覆盖前）", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("处理对象形式的类名", () => {
    const result = cn("btn", { "btn-primary": true, "btn-lg": false });
    expect(result).toBe("btn btn-primary");
  });
});

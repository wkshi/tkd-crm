import "@testing-library/jest-dom";
import { vi } from "vitest";

// 模拟 next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// 模拟 next/head
vi.mock("next/head", () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => children,
  };
});

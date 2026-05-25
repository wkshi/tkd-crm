import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CoachesPage from "@/app/coaches/page";

// 模拟 next/link（避免实际路由跳转）
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CoachesPage 教练管理页", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetchWithData(coaches: unknown[], courses: unknown[]) {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/coaches")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ coaches, total: coaches.length }),
        });
      }
      if (url.includes("/api/courses")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ courses }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as unknown as typeof fetch;
  }

  it("默认显示教练列表 Tab", async () => {
    mockFetchWithData(
      [
        { id: "c1", name: "李教练", gender: "male", joinDate: "2022-03-01", phone: "13800138000", status: "active" },
      ],
      []
    );

    render(<CoachesPage />);

    await waitFor(() => {
      expect(screen.getByText("李教练")).toBeInTheDocument();
    });

    // 验证 Tab 存在
    expect(screen.getByText("教练列表")).toBeInTheDocument();
    expect(screen.getByText("课时统计")).toBeInTheDocument();
  });

  it("切换到课时统计 Tab 显示矩阵表格", async () => {
    mockFetchWithData(
      [
        { id: "c1", name: "李教练", gender: "male", joinDate: "2022-03-01", phone: null, status: "active" },
        { id: "c2", name: "王教练", gender: "female", joinDate: "2023-06-15", phone: null, status: "active" },
      ],
      [
        { id: "course1", coachId: "c1", startTime: "2025-05-10T10:00:00.000Z", title: "常规课" },
        { id: "course2", coachId: "c1", startTime: "2025-05-15T14:00:00.000Z", title: "常规课" },
        { id: "course3", coachId: "c2", startTime: "2025-05-20T10:00:00.000Z", title: "常规课" },
        { id: "course4", coachId: "c1", startTime: "2025-04-05T10:00:00.000Z", title: "常规课" },
      ]
    );

    render(<CoachesPage />);

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText("李教练")).toBeInTheDocument();
    });

    // 切换到课时统计 Tab
    fireEvent.click(screen.getByText("课时统计"));

    // 验证表格表头包含月份
    await waitFor(() => {
      expect(screen.getByText("2025年5月")).toBeInTheDocument();
    });
    expect(screen.getByText("2025年4月")).toBeInTheDocument();

    // 验证教练课时数据
    const rows = screen.getAllByRole("row");
    // 找到包含李教练和王教练的数据行
    const liRow = rows.find((r) => r.textContent?.includes("李教练"));
    const wangRow = rows.find((r) => r.textContent?.includes("王教练"));

    expect(liRow).toBeDefined();
    expect(wangRow).toBeDefined();

    // 李教练 2025年5月有 2 节课，2025年4月有 1 节课，总计 3 节
    expect(liRow?.textContent).toContain("2");
    expect(liRow?.textContent).toContain("3");

    // 王教练 2025年5月有 1 节课，总计 1 节
    expect(wangRow?.textContent).toContain("1");

    // 验证合计行
    expect(screen.getByText("合计")).toBeInTheDocument();
  });

  it("课时统计中无课时的教练显示为 —", async () => {
    mockFetchWithData(
      [
        { id: "c1", name: "李教练", gender: "male", joinDate: "2022-03-01", phone: null, status: "active" },
        { id: "c2", name: "王教练", gender: "female", joinDate: "2023-06-15", phone: null, status: "active" },
      ],
      [
        { id: "course1", coachId: "c1", startTime: "2025-05-10T10:00:00.000Z", title: "常规课" },
      ]
    );

    render(<CoachesPage />);

    await waitFor(() => {
      expect(screen.getByText("李教练")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("课时统计"));

    await waitFor(() => {
      expect(screen.getByText("2025年5月")).toBeInTheDocument();
    });

    // 王教练在 2025年5月没有课时，应该显示 —
    const wangRow = screen
      .getAllByRole("row")
      .find((r) => r.textContent?.includes("王教练"));
    expect(wangRow?.textContent).toContain("—");
  });
});

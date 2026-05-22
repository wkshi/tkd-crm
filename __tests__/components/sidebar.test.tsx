import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

describe("Sidebar 侧边栏组件", () => {
  it("渲染侧边栏导航菜单", () => {
    render(<Sidebar />);

    // 验证 Logo 文字
    expect(screen.getByText("跆拳道 CRM")).toBeInTheDocument();

    // 验证所有导航项
    expect(screen.getByText("仪表盘")).toBeInTheDocument();
    expect(screen.getByText("学员管理")).toBeInTheDocument();
    expect(screen.getByText("教练管理")).toBeInTheDocument();
    expect(screen.getByText("课表日历")).toBeInTheDocument();
    expect(screen.getByText("考勤查询")).toBeInTheDocument();
    expect(screen.getByText("数据备份")).toBeInTheDocument();
    expect(screen.getByText("AI 助手")).toBeInTheDocument();
  });

  it("导航链接指向正确路由", () => {
    render(<Sidebar />);

    expect(screen.getByText("仪表盘").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("学员管理").closest("a")).toHaveAttribute(
      "href",
      "/students"
    );
    expect(screen.getByText("教练管理").closest("a")).toHaveAttribute(
      "href",
      "/coaches"
    );
    expect(screen.getByText("课表日历").closest("a")).toHaveAttribute(
      "href",
      "/calendar"
    );
  });
});

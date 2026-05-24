import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StudentForm } from "@/components/students/student-form";

describe("StudentForm 学员表单", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ classes: [] }),
    });
  });

  it("渲染所有字段", () => {
    const { container } = render(<StudentForm />);

    // 通过 label 文本和 input 标签名查找
    expect(screen.getByText(/姓名/i)).toBeInTheDocument();
    expect(screen.getByText(/性别/i)).toBeInTheDocument();
    expect(screen.getByText(/剩余课时/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /保存/i })).toBeInTheDocument();

    // 验证存在多个输入框
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it("编辑模式下预填充数据", () => {
    const { container } = render(
      <StudentForm
        initialData={{
          name: "编辑学员",
          gender: "male",
          remainingSessions: 15,
          phone: "13900139000",
          status: "active",
        }}
      />
    );

    // 查找所有 text input，第一个是姓名
    const textInputs = container.querySelectorAll('input:not([type="number"]):not([type="date"]):not([type="file"])');
    const nameInput = textInputs[0] as HTMLInputElement;
    expect(nameInput.value).toBe("编辑学员");
  });

  it("提交表单时调用 API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id" }),
    });
    global.fetch = mockFetch;

    const { container } = render(<StudentForm />);

    // 第一个 input 是姓名
    const textInputs = container.querySelectorAll('input:not([type="number"]):not([type="date"]):not([type="file"])');
    const nameInput = textInputs[0] as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "新学员" } });

    // number input 是剩余课时
    const numberInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: "20" } });

    fireEvent.click(screen.getByRole("button", { name: /保存/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/students",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("编辑模式使用 PUT 请求", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "student-1" }),
    });
    global.fetch = mockFetch;

    render(<StudentForm studentId="student-1" initialData={{ name: "老学员" }} />);

    fireEvent.click(screen.getByRole("button", { name: /保存/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/students/student-1",
        expect.objectContaining({
          method: "PUT",
        })
      );
    });
  });
});

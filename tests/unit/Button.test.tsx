import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/atoms/Button";

describe("<Button />", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders an anchor when href is provided", () => {
    render(<Button href="/products">Go</Button>);
    const link = screen.getByRole("link", { name: /go/i });
    expect(link).toHaveAttribute("href", "/products");
  });

  it("applies responsive size classes", () => {
    render(
      <Button size={{ base: "sm", md: "lg" }}>R</Button>,
    );
    const btn = screen.getByRole("button");
    // class string contains both base (text-body-sm) and md: prefix
    expect(btn.className).toMatch(/text-body-sm/);
    expect(btn.className).toMatch(/md:text-body-lg/);
  });

  it("respects disabled state", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Off
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

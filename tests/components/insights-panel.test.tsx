import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InsightsPanel } from "@/components/main-panel/insights";

describe("InsightsPanel", () => {
  it("shows a refresh button that spins and cannot be clicked during a request", () => {
    const onRefresh = vi.fn();
    const { rerender } = render(<InsightsPanel data={null} error={null} canRefresh onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole("button", { name: "Refresh insights" }));
    expect(onRefresh).toHaveBeenCalledOnce();
    rerender(<InsightsPanel data={null} error={null} updating canRefresh onRefresh={onRefresh} />);
    const updating = screen.getByRole("button", { name: "Updating insights" });
    expect(updating).toBeDisabled();
    expect(updating.querySelector("svg")).toHaveClass("animate-spin");
    fireEvent.click(updating);
    expect(onRefresh).toHaveBeenCalledOnce();
    rerender(<InsightsPanel data={null} error={null} canRefresh={false} onRefresh={onRefresh} />);
    expect(screen.getByRole("button", { name: "Refresh insights" })).toBeDisabled();
  });
  it("shows independent current and all topics, with details collapsed initially", () => {
    const data = {
      allTopics: [{ title: "Budget", summary: "The full budget discussion." }, { title: "Schedule", summary: "The schedule." }],
      currentTopic: { title: "Budget", summary: "Returning to budget estimates." },
    };
    render(<InsightsPanel data={data} error={null} />);
    expect(screen.getByRole("heading", { name: "AI Insights", level: 2 })).toBeVisible();
    expect(screen.getByRole("complementary", { name: "AI Insights" })).toBeVisible();
    const all = screen.getByRole("region", { name: "All Topics" });
    const current = screen.getByRole("region", { name: "Current Topic" });
    expect(within(all).getByText("Budget").closest("details")).not.toHaveAttribute("open");
    expect(within(current).getByText("Budget").closest("details")).not.toHaveAttribute("open");
    fireEvent.click(within(current).getByText("Budget"));
    expect(within(current).getByText("Budget").closest("details")).toHaveAttribute("open");
    expect(within(current).getByText("Returning to budget estimates.")).toBeVisible();
    expect(within(all).getByText("Budget").closest("details")).not.toHaveAttribute("open");
  });
});

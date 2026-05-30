import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import LeadForm from "@/components/LeadForm";

const mockOnSubmit = vi.fn();

describe("LeadForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockReset();
  });

  it("renders all form fields", () => {
    render(<LeadForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit/i }),
    ).toBeInTheDocument();
  });

  it("prevents submission with empty required fields", async () => {
    const user = userEvent.setup();
    render(<LeadForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("calls onSubmit with valid data", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LeadForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@acme.com");
    await user.type(screen.getByLabelText(/company/i), "Acme Corp");

    const budgetButton = screen.getByRole("combobox", { expanded: false });
    await user.click(budgetButton);
    const option = await screen.findByRole("option", { name: /under \$10k/i });
    await user.click(option);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@acme.com",
        company: "Acme Corp",
        budget: "under_10k",
      });
    });
  });

  it("disables the submit button while submitting", () => {
    render(<LeadForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
  });

  it("opens budget dropdown on click and shows all options", async () => {
    const user = userEvent.setup();
    render(<LeadForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const budgetButton = screen.getByRole("combobox");
    await user.click(budgetButton);

    expect(screen.getByRole("option", { name: /under \$10k/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /\$10k - \$50k/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /greater than \$50k/i })).toBeInTheDocument();
  });
});

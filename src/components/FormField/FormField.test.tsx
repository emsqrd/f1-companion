import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormField, FormFieldInput, FormFieldSwitch, FormFieldTextarea } from './FormField';

describe('FormField', () => {
  describe('Label and Children Rendering', () => {
    it('should render label with required indicator when required is true', () => {
      render(
        <FormField label="Test Label" id="test" required>
          <input id="test" />
        </FormField>,
      );

      const label = screen.getByText(/test label/i);
      expect(label).toHaveClass("after:content-['*']");
    });

    it('should render label without required indicator when required is false', () => {
      render(
        <FormField label="Test Label" id="test" required={false}>
          <input id="test" />
        </FormField>,
      );

      const label = screen.getByText(/test label/i);
      expect(label).not.toHaveClass("after:content-['*']");
    });

    it('should render children elements', () => {
      render(
        <FormField label="Test Label" id="test">
          <input id="test" data-testid="custom-input" />
        </FormField>,
      );

      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });

  describe('Error and Help Text Display', () => {
    it('should display error message when error is provided', () => {
      render(
        <FormField label="Test Label" id="test" error="This field has an error">
          <input id="test" />
        </FormField>,
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field has an error');
    });

    it('should display help text when no error is present', () => {
      render(
        <FormField label="Test Label" id="test" helpText="This is helpful information">
          <input id="test" />
        </FormField>,
      );

      expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    });

    it('should hide help text when error is present', () => {
      render(
        <FormField
          label="Test Label"
          id="test"
          error="Error message"
          helpText="Help text should be hidden"
        >
          <input id="test" />
        </FormField>,
      );

      expect(screen.queryByText('Help text should be hidden')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('FormFieldInput', () => {
    it('should render input with correct accessibility attributes when error is present', () => {
      const mockRegister = {
        name: 'testField',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      };

      render(
        <FormFieldInput label="Email" id="email" error="Invalid email" register={mockRegister} />,
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should render input with correct accessibility attributes when help text is present', () => {
      const mockRegister = {
        name: 'testField',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      };

      render(
        <FormFieldInput
          label="Email"
          id="email"
          helpText="Enter your email address"
          register={mockRegister}
        />,
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should apply error styling when error is present', () => {
      const mockRegister = {
        name: 'testField',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      };

      render(
        <FormFieldInput label="Email" id="email" error="Invalid email" register={mockRegister} />,
      );

      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('border-destructive');
    });
  });

  describe('FormFieldTextarea', () => {
    it('should render textarea with correct accessibility attributes when error is present', () => {
      const mockRegister = {
        name: 'testField',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      };

      render(
        <FormFieldTextarea
          label="Description"
          id="description"
          error="Description is required"
          register={mockRegister}
        />,
      );

      const textarea = screen.getByLabelText(/description/i);
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'description-error');
    });

    it('should apply error styling when error is present', () => {
      const mockRegister = {
        name: 'testField',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      };

      render(
        <FormFieldTextarea
          label="Description"
          id="description"
          error="Invalid description"
          register={mockRegister}
        />,
      );

      const textarea = screen.getByLabelText(/description/i);
      expect(textarea).toHaveClass('border-destructive');
    });
  });

  describe('FormFieldSwitch', () => {
    it('should call onCheckedChange when switch is toggled', async () => {
      const handleChange = vi.fn();

      render(
        <FormFieldSwitch
          label="Private"
          id="private"
          checked={false}
          onCheckedChange={handleChange}
        />,
      );

      const switchElement = screen.getByRole('switch', { name: /private/i });
      switchElement.click();

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should render switch with correct accessibility attributes when error is present', () => {
      const handleChange = vi.fn();

      render(
        <FormFieldSwitch
          label="Private"
          id="private"
          checked={false}
          onCheckedChange={handleChange}
          error="This field is required"
        />,
      );

      const switchElement = screen.getByRole('switch', { name: /private/i });
      expect(switchElement).toHaveAttribute('aria-invalid', 'true');
      expect(switchElement).toHaveAttribute('aria-describedby', 'private-error');
    });

    it('should display error message for switch when error is provided', () => {
      const handleChange = vi.fn();

      render(
        <FormFieldSwitch
          label="Private"
          id="private"
          checked={false}
          onCheckedChange={handleChange}
          error="Switch error message"
        />,
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Switch error message');
    });
  });
});

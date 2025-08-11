import type { Team as TeamType } from '@/contracts/Team';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Team } from './Team';

// Mock ResizeObserver for Radix UI components
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock child components to isolate Team component testing
vi.mock('../DriverPicker/DriverPicker', () => ({
  DriverPicker: vi.fn(({ slotsCount = 4 }) => (
    <div data-testid="driver-picker" data-slots-count={slotsCount}>
      Mocked DriverPicker with {slotsCount} slots
    </div>
  )),
}));

vi.mock('../ConstructorPicker/ConstructorPicker', () => ({
  ConstructorPicker: vi.fn(({ slotsCount = 4 }) => (
    <div data-testid="constructor-picker" data-slots-count={slotsCount}>
      Mocked ConstructorPicker with {slotsCount} slots
    </div>
  )),
}));

const mockTeam: TeamType = {
  id: 1,
  name: 'Test Team',
};

describe('Team', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Team team={mockTeam} />);
  });

  describe('Initial State', () => {
    it('renders with drivers tab selected by default', () => {
      // Check that the drivers tab is active by default
      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      expect(driversTab).toHaveAttribute('aria-selected', 'true');

      // Check that constructors tab is not active
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      expect(constructorsTab).toHaveAttribute('aria-selected', 'false');
    });

    it('displays drivers content by default', () => {
      // Drivers content should be visible
      expect(screen.getByTestId('driver-picker')).toBeInTheDocument();

      // Check for card title specifically (not the tab text)
      const cardTitles = screen.getAllByText('Drivers');
      expect(cardTitles.length).toBeGreaterThan(0);

      // Constructors content should not be visible
      expect(screen.queryByTestId('constructor-picker')).not.toBeInTheDocument();
    });

    //TODO: Commenting out for now until I finalize how the teams will display
    // it('renders both tab options', () => {
    //   render(<Team team={mockTeam} />);

    //   expect(screen.getByRole('tab', { name: /drivers/i })).toBeInTheDocument();
    //   expect(screen.getByRole('tab', { name: /constructors/i })).toBeInTheDocument();
    // });
  });

  describe('Tab Navigation', () => {
    it('switches to constructors tab when clicked', async () => {
      const user = userEvent.setup();

      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      await user.click(constructorsTab);

      // Constructors tab should now be active
      expect(constructorsTab).toHaveAttribute('aria-selected', 'true');

      // Drivers tab should no longer be active
      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      expect(driversTab).toHaveAttribute('aria-selected', 'false');
    });

    it('displays constructors content when constructors tab is selected', async () => {
      const user = userEvent.setup();
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      await user.click(constructorsTab);

      // Constructors content should be visible
      expect(screen.getByTestId('constructor-picker')).toBeInTheDocument();

      // Check for card title specifically (not the tab text)
      const cardTitles = screen.getAllByText('Constructors');
      expect(cardTitles.length).toBeGreaterThan(0);

      // Drivers content should not be visible
      expect(screen.queryByTestId('driver-picker')).not.toBeInTheDocument();
    });

    it('switches back to drivers tab when clicked', async () => {
      const user = userEvent.setup();

      // First switch to constructors
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      await user.click(constructorsTab);

      // Then switch back to drivers
      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      await user.click(driversTab);

      // Drivers tab should be active again
      expect(driversTab).toHaveAttribute('aria-selected', 'true');
      expect(constructorsTab).toHaveAttribute('aria-selected', 'false');

      // Drivers content should be visible
      expect(screen.getByTestId('driver-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('constructor-picker')).not.toBeInTheDocument();
    });

    it('supports keyboard navigation between tabs', async () => {
      const user = userEvent.setup();

      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });

      // Focus on drivers tab first
      driversTab.focus();
      expect(driversTab).toHaveFocus();

      // Navigate to constructors tab using arrow key
      await user.keyboard('{ArrowRight}');
      expect(constructorsTab).toHaveFocus();

      // Activate the focused tab
      await user.keyboard('{Enter}');
      expect(constructorsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('constructor-picker')).toBeInTheDocument();
    });
  });

  describe('Content Delivery', () => {
    it('passes correct slotsCount to DriverPicker', () => {
      const driverPicker = screen.getByTestId('driver-picker');
      expect(driverPicker).toHaveAttribute('data-slots-count', '4');
    });

    it('passes correct slotsCount to ConstructorPicker', async () => {
      const user = userEvent.setup();

      // Switch to constructors tab
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      await user.click(constructorsTab);

      const constructorPicker = screen.getByTestId('constructor-picker');
      expect(constructorPicker).toHaveAttribute('data-slots-count', '4');
    });

    it('ensures only one tab content is visible at a time', async () => {
      const user = userEvent.setup();

      // Initially only drivers content should be visible
      expect(screen.getByTestId('driver-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('constructor-picker')).not.toBeInTheDocument();

      // Switch to constructors
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });
      await user.click(constructorsTab);

      // Now only constructors content should be visible
      expect(screen.queryByTestId('driver-picker')).not.toBeInTheDocument();
      expect(screen.getByTestId('constructor-picker')).toBeInTheDocument();

      // Switch back to drivers
      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      await user.click(driversTab);

      // Back to drivers content only
      expect(screen.getByTestId('driver-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('constructor-picker')).not.toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('maintains state consistency throughout interaction', async () => {
      const user = userEvent.setup();

      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });

      // Perform multiple tab switches
      await user.click(constructorsTab);
      await user.click(driversTab);
      await user.click(constructorsTab);
      await user.click(driversTab);

      // Final state should be consistent
      expect(driversTab).toHaveAttribute('aria-selected', 'true');
      expect(constructorsTab).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByTestId('driver-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('constructor-picker')).not.toBeInTheDocument();
    });

    it('provides clear indication of current tab selection', () => {
      const driversTab = screen.getByRole('tab', { name: /drivers/i });
      const constructorsTab = screen.getByRole('tab', { name: /constructors/i });

      // One tab should be selected, one should not
      expect(driversTab).toHaveAttribute('aria-selected', 'true');
      expect(constructorsTab).toHaveAttribute('aria-selected', 'false');
    });
  });
});

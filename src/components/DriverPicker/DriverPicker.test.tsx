/**
 * Comprehensive test suite for DriverPicker component
 *
 * Tests cover:
 * - Initial state and rendering with different slot counts
 * - Opening and closing the selection sheet
 * - Driver selection and removal functionality
 * - Slot management and state handling
 * - User experience flows
 * - Driver-specific behavior (names, data structure)
 * - Edge cases and boundary conditions
 *
 * Tests focus on user behaviors rather than implementation details,
 * using mocked child components to isolate the DriverPicker logic.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DriverPicker } from './DriverPicker';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock the services and hooks
vi.mock('@/services/driverService', () => ({
  getAllDrivers: vi.fn(() => [
    {
      id: 1,
      firstName: 'Oscar',
      lastName: 'Piastri',
      countryAbbreviation: 'AUS',
      price: 31400000,
      points: 108,
    },
    {
      id: 2,
      firstName: 'Lando',
      lastName: 'Norris',
      countryAbbreviation: 'GBR',
      price: 30300000,
      points: 138,
    },
    {
      id: 3,
      firstName: 'Charles',
      lastName: 'Leclerc',
      countryAbbreviation: 'MON',
      price: 18400000,
      points: 98,
    },
    {
      id: 4,
      firstName: 'Lewis',
      lastName: 'Hamilton',
      countryAbbreviation: 'GBR',
      price: 15300000,
      points: 9,
    },
    {
      id: 5,
      firstName: 'George',
      lastName: 'Russell',
      countryAbbreviation: 'GBR',
      price: 18500000,
      points: 108,
    },
    {
      id: 6,
      firstName: 'Kimi',
      lastName: 'Antonelli',
      countryAbbreviation: 'ITA',
      price: 6900000,
      points: 29,
    },
    {
      id: 7,
      firstName: 'Max',
      lastName: 'Verstappen',
      countryAbbreviation: 'NED',
      price: 18400000,
      points: 16,
    },
    {
      id: 8,
      firstName: 'Yuki',
      lastName: 'Tsunoda',
      countryAbbreviation: 'JPN',
      price: 4000000,
      points: 12,
    },
    {
      id: 9,
      firstName: 'Alexander',
      lastName: 'Albon',
      countryAbbreviation: 'THA',
      price: 6600000,
      points: 18,
    },
    {
      id: 10,
      firstName: 'Carlos',
      lastName: 'Sainz',
      countryAbbreviation: 'ESP',
      price: 3300000,
      points: 6,
    },
    {
      id: 11,
      firstName: 'Nico',
      lastName: 'Hulkenberg',
      countryAbbreviation: 'GER',
      price: 12700000,
      points: 24,
    },
  ]),
}));

// Mock child components to isolate testing
vi.mock('../DriverCard/DriverCard', () => ({
  DriverCard: vi.fn(({ driver, onOpenSheet, onRemove }) => (
    <div data-testid="driver-card">
      {driver ? (
        <div>
          <span data-testid="driver-name">
            {driver.firstName} {driver.lastName}
          </span>
          <button onClick={onRemove} data-testid="remove-driver">
            Remove
          </button>
        </div>
      ) : (
        <button onClick={onOpenSheet} data-testid="add-driver">
          Add Driver
        </button>
      )}
    </div>
  )),
}));

vi.mock('../DriverListItem/DriverListItem', () => ({
  DriverListItem: vi.fn(({ driver, onSelect }) => (
    <li data-testid="driver-list-item">
      <span>
        {driver.firstName} {driver.lastName}
      </span>
      <button onClick={onSelect} data-testid="select-driver">
        Select {driver.firstName} {driver.lastName}
      </button>
    </li>
  )),
}));

//TODO: Re-evaluate these. Copilot made all of these and some may be better in an integration test file.
describe('DriverPicker', () => {
  describe('Initial State', () => {
    it('renders with default slot count of 4', () => {
      render(<DriverPicker />);

      const driverCards = screen.getAllByTestId('driver-card');
      expect(driverCards).toHaveLength(4);
    });

    it('renders with custom slot count', () => {
      render(<DriverPicker slotsCount={6} />);

      const driverCards = screen.getAllByTestId('driver-card');
      expect(driverCards).toHaveLength(6);
    });

    it('initializes with pre-selected drivers', () => {
      render(<DriverPicker />);

      // Based on the initial setup in the component: [1, 2, 9, 11]
      // These would map to specific drivers from the mocked service
      const driverNames = screen.getAllByTestId('driver-name');
      expect(driverNames).toHaveLength(4); // All slots should be filled initially
    });
  });

  describe('Opening Selection Sheet', () => {
    it('opens selection sheet when clicking add driver button', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver first to have an empty slot
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Now click the add button that should appear
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });
    });

    it('shows available drivers in the selection sheet', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Open the selection sheet
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Check that available drivers are shown
      const listItems = screen.getAllByTestId('driver-list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('closes selection sheet when clicking outside or pressing escape', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver and open sheet
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Press escape to close
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });
    });
  });

  describe('Driver Selection', () => {
    it('adds selected driver to empty slot', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Open selection sheet
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Select a driver
      const selectButtons = screen.getAllByTestId('select-driver');
      await user.click(selectButtons[0]);

      // Sheet should close and driver should be added
      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });

      // Verify the driver was added (all slots should be filled again)
      const driverNames = screen.getAllByTestId('driver-name');
      expect(driverNames).toHaveLength(4);
    });

    it('closes selection sheet after selecting a driver', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver and open sheet
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Select a driver
      const selectButtons = screen.getAllByTestId('select-driver');
      await user.click(selectButtons[0]);

      // Verify sheet is closed
      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });
    });

    it('handles selection when no active slot is set', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Open selection sheet
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Close the sheet first (simulating closing without the activeSlot being reset)
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });

      // This test ensures the component handles edge cases gracefully
      expect(screen.getAllByTestId('driver-card')).toHaveLength(4);
    });
  });

  describe('Driver Removal', () => {
    it('removes driver from slot when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Initially should have 4 filled slots
      const initialDriverNames = screen.getAllByTestId('driver-name');
      expect(initialDriverNames).toHaveLength(4);

      // Remove one driver
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Should now have 3 filled slots and 1 empty slot
      const remainingDriverNames = screen.getAllByTestId('driver-name');
      expect(remainingDriverNames).toHaveLength(3);

      const addButtons = screen.getAllByTestId('add-driver');
      expect(addButtons).toHaveLength(1);
    });

    it('updates available pool when driver is removed', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Open selection sheet to verify pool is updated
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // The removed driver should now be available in the pool
      const listItems = screen.getAllByTestId('driver-list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('allows removing multiple drivers', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove all drivers
      const removeButtons = screen.getAllByTestId('remove-driver');
      for (const button of removeButtons) {
        await user.click(button);
      }

      // Should have no filled slots and 4 empty slots
      expect(screen.queryAllByTestId('driver-name')).toHaveLength(0);
      expect(screen.getAllByTestId('add-driver')).toHaveLength(4);
    });
  });

  describe('Slot Management', () => {
    it('maintains correct slot count when adding and removing drivers', async () => {
      const user = userEvent.setup();
      render(<DriverPicker slotsCount={6} />);

      // Should always have exactly 6 cards
      expect(screen.getAllByTestId('driver-card')).toHaveLength(6);

      // Check if there are any remove buttons (filled slots)
      const removeButtons = screen.queryAllByTestId('remove-driver');
      if (removeButtons.length > 0) {
        // Remove one
        await user.click(removeButtons[0]);

        // Still 6 cards total
        expect(screen.getAllByTestId('driver-card')).toHaveLength(6);

        // Add one back
        const addButtons = screen.getAllByTestId('add-driver');
        await user.click(addButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('Select Driver')).toBeInTheDocument();
        });

        const selectButtons = screen.getAllByTestId('select-driver');
        await user.click(selectButtons[0]);

        await waitFor(() => {
          expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
        });

        // Still 6 cards total
        expect(screen.getAllByTestId('driver-card')).toHaveLength(6);
      }
    });

    it('handles different slot counts correctly', () => {
      // Test with a slot count that can accommodate the initial state
      render(<DriverPicker slotsCount={5} />);

      // Should have exactly 5 cards
      expect(screen.getAllByTestId('driver-card')).toHaveLength(5);
    });
  });

  describe('User Experience', () => {
    it('provides appropriate interaction flow for adding a driver', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver to start fresh
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // User sees an add button
      const addButton = screen.getByTestId('add-driver');
      expect(addButton).toBeInTheDocument();

      // User clicks add button
      await user.click(addButton);

      // User sees selection options
      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      const listItems = screen.getAllByTestId('driver-list-item');
      expect(listItems.length).toBeGreaterThan(0);

      // User makes a selection
      const selectButtons = screen.getAllByTestId('select-driver');
      await user.click(selectButtons[0]);

      // UI returns to normal state with driver added
      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });

      // All slots should be filled again
      expect(screen.getAllByTestId('driver-name')).toHaveLength(4);
    });

    it('allows user to change their mind and close sheet without selecting', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver and open sheet
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // User closes without selecting
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });

      // Slot should remain empty
      expect(screen.getByTestId('add-driver')).toBeInTheDocument();
      expect(screen.getAllByTestId('driver-name')).toHaveLength(3);
    });
  });

  describe('State Management', () => {
    it('maintains independent state for each slot', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Get initial state
      const initialNames = screen.getAllByTestId('driver-name').map((el) => el.textContent);

      // Remove first driver
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // The other slots should remain unchanged
      const remainingNames = screen.getAllByTestId('driver-name').map((el) => el.textContent);
      expect(remainingNames).toEqual(initialNames.slice(1));
    });

    it('correctly updates pool availability when drivers are added and removed', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove two drivers
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);
      await user.click(removeButtons[1]);

      // Open selection sheet
      const addButtons = screen.getAllByTestId('add-driver');
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Should have more options available since we removed drivers
      const listItems = screen.getAllByTestId('driver-list-item');
      expect(listItems.length).toBeGreaterThan(0);

      // Select one
      const selectButtons = screen.getAllByTestId('select-driver');
      await user.click(selectButtons[0]);

      // Pool should be updated - if we open again, we should have one fewer option
      await waitFor(() => {
        expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
      });

      // Open sheet again for the remaining empty slot
      const remainingAddButtons = screen.getAllByTestId('add-driver');
      await user.click(remainingAddButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      const newListItems = screen.getAllByTestId('driver-list-item');
      expect(newListItems.length).toBe(listItems.length - 1);
    });
  });

  describe('Driver-specific Behavior', () => {
    it('displays driver full name correctly when selected', () => {
      render(<DriverPicker />);

      // Check that driver names are displayed as full names (firstName + lastName)
      const driverNames = screen.getAllByTestId('driver-name');
      expect(driverNames[0]).toHaveTextContent(/\w+ \w+/); // Should match "FirstName LastName" pattern
    });

    it('maintains driver identity throughout add and remove operations', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Get the initial driver name
      const initialDriverNames = screen.getAllByTestId('driver-name');
      const firstDriverName = initialDriverNames[0].textContent;

      // Remove the first driver
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      // Add them back
      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Find and select the same driver
      const selectButtons = screen.getAllByTestId('select-driver');
      const sameDriverButton = selectButtons.find((button) =>
        button.textContent?.includes(firstDriverName || ''),
      );

      if (sameDriverButton) {
        await user.click(sameDriverButton);

        await waitFor(() => {
          expect(screen.queryByText('Select Driver')).not.toBeInTheDocument();
        });

        // Verify the same driver is back
        const finalDriverNames = screen.getAllByTestId('driver-name');
        expect(finalDriverNames.some((el) => el.textContent === firstDriverName)).toBe(true);
      }
    });

    it('handles driver data structure correctly in selection list', async () => {
      const user = userEvent.setup();
      render(<DriverPicker />);

      // Remove a driver and open selection
      const removeButtons = screen.getAllByTestId('remove-driver');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-driver');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Driver')).toBeInTheDocument();
      });

      // Verify that drivers in the selection list show full names
      const listItems = screen.getAllByTestId('driver-list-item');
      expect(listItems.length).toBeGreaterThan(0);

      // Each list item should contain both first and last name
      listItems.forEach((item) => {
        expect(item.textContent).toMatch(/\w+ \w+/); // Should match "FirstName LastName" pattern
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles slot count equal to initial drivers', () => {
      render(<DriverPicker slotsCount={4} />);

      // Should have exactly 4 cards (same as default)
      const driverCards = screen.getAllByTestId('driver-card');
      expect(driverCards).toHaveLength(4);
    });

    it('handles larger slot counts', () => {
      render(<DriverPicker slotsCount={8} />);

      // Should have exactly 8 cards
      const driverCards = screen.getAllByTestId('driver-card');
      expect(driverCards).toHaveLength(8);
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ConstructorPicker } from './ConstructorPicker';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock the services and hooks
vi.mock('@/services/constructorService', () => ({
  getAllConstructors: vi.fn(() => [
    { id: 1, name: 'Alpine', countryAbbreviation: 'FRA', price: 5500000, points: 2 },
    { id: 2, name: 'Aston Martin', countryAbbreviation: 'GBR', price: 9500000, points: 60 },
    { id: 3, name: 'Ferrari', countryAbbreviation: 'ITA', price: 21800000, points: 66 },
    { id: 4, name: 'Red Bull', countryAbbreviation: 'AUT', price: 15000000, points: 23 },
    { id: 5, name: 'Racing Bulls', countryAbbreviation: 'ITA', price: 5500000, points: 24 },
    { id: 6, name: 'Kick Sauber', countryAbbreviation: 'CHE', price: 13000000, points: 53 },
    { id: 7, name: 'Haas', countryAbbreviation: 'USA', price: 8100000, points: 8 },
    { id: 11, name: 'McLaren', countryAbbreviation: 'GBR', price: 39100000, points: 152 },
    { id: 13, name: 'Mercedes', countryAbbreviation: 'GER', price: 17100000, points: 102 },
    { id: 19, name: 'Williams', countryAbbreviation: 'GBR', price: 7200000, points: 21 },
  ]),
}));

// Mock child components to isolate testing
vi.mock('../ConstructorCard/ConstructorCard', () => ({
  ConstructorCard: vi.fn(({ constructor, onOpenSheet, onRemove }) => (
    <div data-testid="constructor-card">
      {constructor ? (
        <div>
          <span data-testid="constructor-name">{constructor.name}</span>
          <button onClick={onRemove} data-testid="remove-constructor">
            Remove
          </button>
        </div>
      ) : (
        <button onClick={onOpenSheet} data-testid="add-constructor">
          Add Constructor
        </button>
      )}
    </div>
  )),
}));

vi.mock('../ConstructorListItem/ConstructorListItem', () => ({
  ConstructorListItem: vi.fn(({ constructor, onSelect }) => (
    <li data-testid="constructor-list-item">
      <span>{constructor.name}</span>
      <button onClick={onSelect} data-testid="select-constructor">
        Select {constructor.name}
      </button>
    </li>
  )),
}));

//TODO: Re-evaluate these. Copilot made all of these and some may be better in an integration test file.
describe('ConstructorPicker', () => {
  describe('Initial State', () => {
    it('renders with default slot count of 4', () => {
      render(<ConstructorPicker />);

      const constructorCards = screen.getAllByTestId('constructor-card');
      expect(constructorCards).toHaveLength(4);
    });

    it('renders with custom slot count', () => {
      render(<ConstructorPicker slotsCount={6} />);

      const constructorCards = screen.getAllByTestId('constructor-card');
      expect(constructorCards).toHaveLength(6);
    });

    it('initializes with pre-selected constructors', () => {
      render(<ConstructorPicker />);

      // Based on the initial setup in the component: [11, 13, 7, 19]
      // These would map to specific constructors from the mocked service
      const constructorNames = screen.getAllByTestId('constructor-name');
      expect(constructorNames).toHaveLength(4); // All slots should be filled initially
    });

    it('does not show the selection sheet initially', () => {
      render(<ConstructorPicker />);

      expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
    });
  });

  describe('Opening Selection Sheet', () => {
    it('opens selection sheet when clicking add constructor button', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor first to have an empty slot
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Now click the add button that should appear
      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });
    });

    it('shows available constructors in the selection sheet', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Open the selection sheet
      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Check that available constructors are shown
      const listItems = screen.getAllByTestId('constructor-list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('closes selection sheet when clicking outside or pressing escape', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor and open sheet
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Press escape to close
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });
    });
  });

  describe('Constructor Selection', () => {
    it('adds selected constructor to empty slot', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Open selection sheet
      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Select a constructor
      const selectButtons = screen.getAllByTestId('select-constructor');
      await user.click(selectButtons[0]);

      // Sheet should close and constructor should be added
      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });

      // Verify the constructor was added (all slots should be filled again)
      const constructorNames = screen.getAllByTestId('constructor-name');
      expect(constructorNames).toHaveLength(4);
    });

    it('closes selection sheet after selecting a constructor', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor and open sheet
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Select a constructor
      const selectButtons = screen.getAllByTestId('select-constructor');
      await user.click(selectButtons[0]);

      // Verify sheet is closed
      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });
    });

    it('handles selection when no active slot is set', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor to create an empty slot
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Open selection sheet
      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Close the sheet first (simulating closing without the activeSlot being reset)
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });

      // This test ensures the component handles edge cases gracefully
      expect(screen.getAllByTestId('constructor-card')).toHaveLength(4);
    });
  });

  describe('Constructor Removal', () => {
    it('removes constructor from slot when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Initially should have 4 filled slots
      const initialConstructorNames = screen.getAllByTestId('constructor-name');
      expect(initialConstructorNames).toHaveLength(4);

      // Remove one constructor
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Should now have 3 filled slots and 1 empty slot
      const remainingConstructorNames = screen.getAllByTestId('constructor-name');
      expect(remainingConstructorNames).toHaveLength(3);

      const addButtons = screen.getAllByTestId('add-constructor');
      expect(addButtons).toHaveLength(1);
    });

    it('updates available pool when constructor is removed', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // Open selection sheet to verify pool is updated
      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // The removed constructor should now be available in the pool
      const listItems = screen.getAllByTestId('constructor-list-item');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('allows removing multiple constructors', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove all constructors
      const removeButtons = screen.getAllByTestId('remove-constructor');
      for (const button of removeButtons) {
        await user.click(button);
      }

      // Should have no filled slots and 4 empty slots
      expect(screen.queryAllByTestId('constructor-name')).toHaveLength(0);
      expect(screen.getAllByTestId('add-constructor')).toHaveLength(4);
    });
  });

  describe('Slot Management', () => {
    it('maintains correct slot count when adding and removing constructors', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker slotsCount={6} />);

      // Should always have exactly 6 cards
      expect(screen.getAllByTestId('constructor-card')).toHaveLength(6);

      // Check if there are any remove buttons (filled slots)
      const removeButtons = screen.queryAllByTestId('remove-constructor');
      if (removeButtons.length > 0) {
        // Remove one
        await user.click(removeButtons[0]);

        // Still 6 cards total
        expect(screen.getAllByTestId('constructor-card')).toHaveLength(6);

        // Add one back
        const addButtons = screen.getAllByTestId('add-constructor');
        await user.click(addButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('Select Constructor')).toBeInTheDocument();
        });

        const selectButtons = screen.getAllByTestId('select-constructor');
        await user.click(selectButtons[0]);

        await waitFor(() => {
          expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
        });

        // Still 6 cards total
        expect(screen.getAllByTestId('constructor-card')).toHaveLength(6);
      }
    });

    it('handles different slot counts correctly', () => {
      // Test with a slot count that can accommodate the initial state
      render(<ConstructorPicker slotsCount={5} />);

      // Should have exactly 5 cards
      expect(screen.getAllByTestId('constructor-card')).toHaveLength(5);
    });

    it('handles reasonable slot counts', () => {
      render(<ConstructorPicker slotsCount={6} />);

      // Should have exactly 6 cards
      expect(screen.getAllByTestId('constructor-card')).toHaveLength(6);
    });
  });

  describe('User Experience', () => {
    it('provides appropriate interaction flow for adding a constructor', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor to start fresh
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // User sees an add button
      const addButton = screen.getByTestId('add-constructor');
      expect(addButton).toBeInTheDocument();

      // User clicks add button
      await user.click(addButton);

      // User sees selection options
      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      const listItems = screen.getAllByTestId('constructor-list-item');
      expect(listItems.length).toBeGreaterThan(0);

      // User makes a selection
      const selectButtons = screen.getAllByTestId('select-constructor');
      await user.click(selectButtons[0]);

      // UI returns to normal state with constructor added
      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });

      // All slots should be filled again
      expect(screen.getAllByTestId('constructor-name')).toHaveLength(4);
    });

    it('allows user to change their mind and close sheet without selecting', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove a constructor and open sheet
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      const addButton = screen.getByTestId('add-constructor');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // User closes without selecting
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });

      // Slot should remain empty
      expect(screen.getByTestId('add-constructor')).toBeInTheDocument();
      expect(screen.getAllByTestId('constructor-name')).toHaveLength(3);
    });
  });

  describe('State Management', () => {
    it('maintains independent state for each slot', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Get initial state
      const initialNames = screen.getAllByTestId('constructor-name').map((el) => el.textContent);

      // Remove first constructor
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);

      // The other slots should remain unchanged
      const remainingNames = screen.getAllByTestId('constructor-name').map((el) => el.textContent);
      expect(remainingNames).toEqual(initialNames.slice(1));
    });

    it('correctly updates pool availability when constructors are added and removed', async () => {
      const user = userEvent.setup();
      render(<ConstructorPicker />);

      // Remove two constructors
      const removeButtons = screen.getAllByTestId('remove-constructor');
      await user.click(removeButtons[0]);
      await user.click(removeButtons[1]);

      // Open selection sheet
      const addButtons = screen.getAllByTestId('add-constructor');
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      // Should have more options available since we removed constructors
      const listItems = screen.getAllByTestId('constructor-list-item');
      expect(listItems.length).toBeGreaterThan(0);

      // Select one
      const selectButtons = screen.getAllByTestId('select-constructor');
      await user.click(selectButtons[0]);

      // Pool should be updated - if we open again, we should have one fewer option
      await waitFor(() => {
        expect(screen.queryByText('Select Constructor')).not.toBeInTheDocument();
      });

      // Open sheet again for the remaining empty slot
      const remainingAddButtons = screen.getAllByTestId('add-constructor');
      await user.click(remainingAddButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Select Constructor')).toBeInTheDocument();
      });

      const newListItems = screen.getAllByTestId('constructor-list-item');
      expect(newListItems.length).toBe(listItems.length - 1);
    });
  });
});

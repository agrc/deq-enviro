import { createContext, useContext } from 'react';

// exported for mocking in Storybook
export const SearchMachineContext = createContext(null);

/**
 * @returns {[
 *   import('xstate').StateFrom<typeof import('./SearchMachine').machine>,
 *   import('xstate').InterpreterFrom<
 *     typeof import('./SearchMachine').machine
 *   >['send'],
 * ]}
 */
export function useSearchMachine() {
  const context = useContext(SearchMachineContext);

  if (context === undefined) {
    throw new Error(
      'useSearchMachine must be used within a SearchMachineProvider',
    );
  }

  return context;
}

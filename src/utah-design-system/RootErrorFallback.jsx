import * as Collapsible from '@radix-ui/react-collapsible';
import PropTypes from 'prop-types';
import Button from './Button';

export default function RootErrorFallback({ error }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-1/2 max-w-xl border border-slate-700 bg-error-50 p-6 transition">
        <h3>Something went wrong</h3>
        <p className="mt-1">
          {error?.message ?? 'An unknown error occurred. Please try again.'}
        </p>
        <Collapsible.Root>
          <div className="mt-4 flex w-full items-center justify-between space-x-4">
            <Collapsible.Trigger asChild>
              <Button appearance="outlined" color="none">
                Show technical details 🤓
              </Button>
            </Collapsible.Trigger>
            <Button
              appearance="solid"
              color="none"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </div>
          <Collapsible.Content
            asChild
            className="mt-4 overflow-auto border border-slate-300 bg-slate-50 text-sm data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down"
          >
            <pre>{error?.stack}</pre>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  );
}

RootErrorFallback.propTypes = {
  error: PropTypes.object,
};

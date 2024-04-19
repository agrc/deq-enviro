import RootErrorFallback from './RootErrorFallback';

export default {
  title: 'RootErrorFallback',
  component: RootErrorFallback,
};

export const DefaultErrorMessage = () => (
  <div className="h-[500px] w-full bg-slate-50">
    <RootErrorFallback
      error={{
        stack:
          'Error: this is a test\n    at RootErrorFallback (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)',
      }}
    />
  </div>
);

export const ErrorMessage = () => (
  <div className="h-[500px] w-full bg-slate-50">
    <RootErrorFallback
      error={{
        stack:
          'Error: this is a test\n    at RootErrorFallback (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)\n    at div (http://localhost:3000/_dist_/src/components/RootErrorFallback.stories.jsx:1:1)',
        message: 'this is a test',
      }}
    />
  </div>
);

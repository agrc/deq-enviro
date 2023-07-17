import Link from './Link';

export default {
  title: 'Utah Design System/Link',
  component: Link,
};

export const Default = () => (
  <>
    This is an external link{' '}
    <Link href="https://www.google.com" external>
      google
    </Link>
    . Internal links <Link href="./test.html">look like this</Link>.
  </>
);

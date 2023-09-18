import Button from './Button';

export default {
  title: 'Utah Design System/Button',
  component: Button,
};

export const Default = () => (
  <>
    <h3>Outlined</h3>
    <p className="space-y-1">
      <Button>Default</Button>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="accent">Accent</Button>
    </p>

    <h3>Solid</h3>
    <p className="space-y-1">
      <Button appearance="solid">Default</Button>
      <Button appearance="solid" color="primary">
        Primary
      </Button>
      <Button appearance="solid" color="secondary">
        Secondary
      </Button>
      <Button appearance="solid" color="accent">
        Accent
      </Button>
    </p>

    <h3>Disabled</h3>
    <p className="space-y-1">
      <Button disabled>Default</Button>
      <Button disabled appearance="solid" color="primary">
        Primary
      </Button>
      <Button disabled color="secondary">
        Secondary
      </Button>
      <Button disabled appearance="solid" color="accent">
        Accent
      </Button>
    </p>

    <h3>Busy</h3>
    <p className="space-y-1">
      <Button busy>Default</Button>
      <Button busy color="secondary" appearance="solid">
        Secondary
      </Button>
    </p>

    <h3>Sizes</h3>
    <p className="space-y-1">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="base" appearance="solid" color="primary">
        Medium
      </Button>
      <Button size="lg">Large</Button>
      <Button size="xl" appearance="solid">
        Extra Large
      </Button>
    </p>

    <h3>Widths</h3>
    <p className="space-y-1">
      <Button>Default</Button>
      <Button className="w-full">Full Width</Button>
    </p>

    <h3>Link Buttons</h3>
    <p className="space-y-1">
      <Button href="https://www.google.com">Default</Button>
    </p>
  </>
);

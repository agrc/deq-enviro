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
      <Button color={Button.Colors.primary}>Primary</Button>
      <Button color={Button.Colors.secondary}>Secondary</Button>
      <Button color={Button.Colors.accent}>Accent</Button>
    </p>

    <h3>Solid</h3>
    <p className="space-y-1">
      <Button appearance={Button.Appearances.solid}>Default</Button>
      <Button
        appearance={Button.Appearances.solid}
        color={Button.Colors.primary}
      >
        Primary
      </Button>
      <Button
        appearance={Button.Appearances.solid}
        color={Button.Colors.secondary}
      >
        Secondary
      </Button>
      <Button
        appearance={Button.Appearances.solid}
        color={Button.Colors.accent}
      >
        Accent
      </Button>
    </p>

    <h3>Disabled</h3>
    <p className="space-y-1">
      <Button disabled>Default</Button>
      <Button
        disabled
        appearance={Button.Appearances.solid}
        color={Button.Colors.primary}
      >
        Primary
      </Button>
      <Button disabled color={Button.Colors.secondary}>
        Secondary
      </Button>
      <Button
        disabled
        appearance={Button.Appearances.solid}
        color={Button.Colors.accent}
      >
        Accent
      </Button>
    </p>

    <h3>Busy</h3>
    <p className="space-y-1">
      <Button busy>Default</Button>
      <Button
        busy
        color={Button.Colors.secondary}
        appearance={Button.Appearances.solid}
      >
        Secondary
      </Button>
    </p>

    <h3>Sizes</h3>
    <p className="space-y-1">
      <Button size={Button.Sizes.xs}>Extra Small</Button>
      <Button size={Button.Sizes.sm}>Small</Button>
      <Button size={Button.Sizes.base} appearance="solid" color="primary">
        Medium
      </Button>
      <Button size={Button.Sizes.lg}>Large</Button>
      <Button size={Button.Sizes.xl} appearance={Button.Appearances.solid}>
        Extra Large
      </Button>
    </p>

    <h3>Widths</h3>
    <p className="space-y-1">
      <Button>Default</Button>
      <Button className="w-full">Full Width</Button>
    </p>
  </>
);

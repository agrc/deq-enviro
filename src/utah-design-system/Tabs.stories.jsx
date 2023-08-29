import * as Tabs from './Tabs';

export default {
  title: 'Utah Design System/Tabs',
  component: Tabs,
};

export const Vertical = () => (
  <Tabs.Root defaultValue="one" orientation="vertical">
    <Tabs.List aria-label="vertical example">
      <Tabs.Trigger value="one">One</Tabs.Trigger>
      <Tabs.Trigger value="two">Two Longer Name</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="one">
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores es qui ratione
        voluptatem sequi nesciunt.
      </p>
      <hr />
      <p>
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora
        incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
      </p>
    </Tabs.Content>
    <Tabs.Content value="two">Tab Two content...</Tabs.Content>
  </Tabs.Root>
);

export const Horizontal = () => (
  <Tabs.Root defaultValue="one">
    <Tabs.List aria-label="vertical example">
      <Tabs.Trigger value="one">One</Tabs.Trigger>
      <Tabs.Trigger value="two">Two</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="one">
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores es qui ratione
        voluptatem sequi nesciunt.
      </p>
      <p>
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora
        incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
      </p>
    </Tabs.Content>
    <Tabs.Content value="two">Tab Two content...</Tabs.Content>
  </Tabs.Root>
);

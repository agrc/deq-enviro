import { AccordionPanel, AccordionRoot } from './Accordion';

export default {
  title: 'Utah Design System/Accordion',
  component: AccordionRoot,
};

export const Default = () => (
  <AccordionRoot type="multiple">
    <AccordionPanel title="Panel 1">
      <p>Panel 1 content</p>
    </AccordionPanel>
    <AccordionPanel title="Panel 2">
      <p>Panel 2 content</p>
    </AccordionPanel>
  </AccordionRoot>
);

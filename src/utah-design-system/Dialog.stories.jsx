import { DialogTitle } from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogTrigger } from './Dialog';

export default {
  title: 'Utah Design System/Dialog',
  component: Dialog,
};

export const Default = () => (
  <Dialog>
    <DialogTrigger>Open Dialog</DialogTrigger>
    <DialogContent>
      <DialogTitle>Title</DialogTitle>
      content
    </DialogContent>
  </Dialog>
);

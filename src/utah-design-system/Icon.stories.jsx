import Icon from './Icon';
import { ICONS } from './Icon.config';

export default {
  title: 'Utah Design System/Icon',
  component: Icon,
};

export const Default = () => (
  <>
    <div className="flex bg-slate-200 leading-6">
      medium
      <Icon name="circleChevronDown" label="chevron down" className="ml-1" />
    </div>
    <div className="flex bg-slate-200 leading-6">
      small
      <Icon
        name="circleChevronDown"
        label="chevron down"
        className="ml-1"
        size="sm"
      />
    </div>
    <div className="flex bg-slate-200 leading-6">
      large
      <Icon
        name="circleChevronDown"
        label="chevron down"
        className="ml-1"
        size="xl"
      />
    </div>
  </>
);

export const AllIcons = () => (
  <div className="grid grid-cols-4 gap-3">
    {Object.keys(ICONS).map((icon) => (
      <div key={icon} className="flex flex-col items-center">
        <Icon
          // @ts-expect-error
          name={icon}
          label={icon}
          size="4xl"
        />
        <span className="text-sm">{icon}</span>
      </div>
    ))}
  </div>
);

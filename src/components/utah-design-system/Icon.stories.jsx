import Icon from './Icon';

export default {
  title: 'Utah Design System/Icon',
  component: Icon,
};

export const Default = () => (
  <>
    <div className="flex bg-gray-200 leading-6">
      medium
      <Icon
        name={Icon.Names.circleChevronDown}
        label="chevron down"
        className="ml-1"
      />
    </div>
    <div className="flex bg-gray-200 leading-6">
      small
      <Icon
        name={Icon.Names.circleChevronDown}
        label="chevron down"
        className="ml-1"
        size="sm"
      />
    </div>
    <div className="flex bg-gray-200 leading-6">
      large (not working at the moment)
      <Icon
        name={Icon.Names.circleChevronDown}
        label="chevron down"
        className="ml-1"
        size="xl"
      />
    </div>
  </>
);

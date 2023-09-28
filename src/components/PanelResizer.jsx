import clsx from 'clsx';
import { useRef, useState } from 'react';
import Draggable from 'react-draggable';

/**
 * @param {object} props
 * @param {number} props.dragValue
 * @param {function} props.onResize
 * @param {boolean} props.show
 * @param {number} props.initialHeight
 * @returns {JSX.Element}
 */
export default function PanelResizer({
  dragValue,
  onResize,
  show,
  initialHeight,
}) {
  const ref = useRef(null);
  const [cursor, setCursor] = useState('grab');
  const [isHovering, setIsHovering] = useState(false);

  const style = {
    cursor,
    display: show ? 'flex' : 'none',
    bottom: `${initialHeight - 4}px`,
  };

  return (
    <Draggable
      // we are controlling this component so that we make sure that it
      // appears at the correct height after it has been remounted
      position={{ x: 0, y: dragValue }}
      axis="y"
      onStart={() => setCursor('grabbing')}
      onStop={() => setCursor('grab')}
      onDrag={(_, { y }) => onResize(y)}
      nodeRef={ref}
      bounds="parent"
    >
      <div
        ref={ref}
        className={clsx(
          'absolute z-10 h-[8px] w-3/4 items-center justify-center rounded bg-slate-200 opacity-25',
          isHovering && 'opacity-75',
        )}
        style={style}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <hr className="m-0 w-1/2"></hr>
      </div>
    </Draggable>
  );
}

import clsx from 'clsx';
import { useRef, useState } from 'react';
import Draggable from 'react-draggable';

/**
 * @param {object} props
 * @param {function} props.onResize
 * @param {boolean} props.show
 * @param {number} props.initialHeight
 * @returns {JSX.Element}
 */
export default function PanelResizer({ onResize, show, initialHeight }) {
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

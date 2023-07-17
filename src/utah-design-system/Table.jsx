import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import PropTypes from 'prop-types';
import { forwardRef, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { twJoin, twMerge } from 'tailwind-merge';

// note: I tried v3 beta of react-virtual but it didn't quite work
// ref: https://tanstack.com/table/v8/docs/examples/react/virtualized-rows
const Table = forwardRef(function Table(
  { columns, data, className, caption, ...props },
  forwardedRef
) {
  const { getHeaderGroups, getRowModel } = useReactTable({
    ...props,
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = useRef();
  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    overscan: 10,
  });
  const { rows } = getRowModel();

  // Ref: https://tanstack.com/table/v8/docs/examples/react/virtualized-rows
  const { virtualItems: virtualRows, totalSize } = rowVirtualizer;
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div
      ref={forwardedRef}
      className={twMerge(
        'relative flex flex-col border-b border-b-slate-300',
        className
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="h-full overflow-y-auto" ref={parentRef} tabIndex={0}>
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead
            className={twJoin(
              'sticky top-0 bg-white',
              'after:absolute after:bottom-0 after:left-0 after:w-full after:border-b after:border-b-slate-300 after:content-[""]'
            )}
          >
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <tr
                  key={virtualRow.key}
                  className={twJoin(
                    'border-y border-y-slate-300',
                    // using the even pseudo-class doesn't work since the virtualizer is always changing the rendered rows
                    virtualRow.index % 2 ? 'bg-white' : 'bg-slate-100'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="truncate p-2"
                      title={cell.getValue()}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default Table;

Table.propTypes = {
  caption: PropTypes.string.isRequired,
  className: PropTypes.string,
  /**
   * Corresponds to the same prop in react table (https://tanstack.com/table/v8/docs/api/core/table#columns)
   */
  columns: PropTypes.array.isRequired,
  /**
   * Corresponds to the same prop in react table (https://tanstack.com/table/v8/docs/api/core/table#data)
   */
  data: PropTypes.array.isRequired,
  /**
   * All other props are passed to the useReactTable hook
   */
};

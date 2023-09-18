import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import PropTypes from 'prop-types';
import { twJoin } from 'tailwind-merge';

function SimpleTable({
  caption,
  className,
  columns,
  data,
  hideHeaders,
  ...props
}) {
  const { getHeaderGroups, getRowModel } = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    ...props,
  });

  const { rows } = getRowModel();

  return (
    <div className={className}>
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        {hideHeaders ? null : (
          <thead
            className={twJoin(
              'sticky top-0 bg-white',
              'after:absolute after:bottom-0 after:left-0 after:w-full after:border-b after:border-b-slate-300 after:content-[""]',
            )}
          >
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative p-2 text-left"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                      <div
                        className={twJoin(
                          header.column.getCanSort() &&
                            'flex cursor-pointer select-none items-center justify-between',
                          header.column.getIsSorted() &&
                            'before:content=[""] text-primary before:absolute before:-bottom-1 before:left-0 before:z-10 before:block before:h-2 before:w-full before:rounded-full before:bg-primary',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={twJoin(
                  'group/row border-y border-y-slate-300',
                  // using the even pseudo-class doesn't work since the virtualizer is always changing the rendered rows
                  row.index % 2 ? 'bg-white' : 'bg-slate-100',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-break-spaces p-2"
                    // @ts-ignore
                    title={cell.getValue()}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SimpleTable;

SimpleTable.propTypes = {
  caption: PropTypes.string.isRequired,
  className: PropTypes.string,

  /**
   * Corresponds to the same prop in react table
   * (https://tanstack.com/table/v8/docs/api/core/table#columns)
   */
  columns: PropTypes.array.isRequired,

  /**
   * Corresponds to the same prop in react table
   * (https://tanstack.com/table/v8/docs/api/core/table#data)
   */
  data: PropTypes.array.isRequired,

  hideHeaders: PropTypes.bool,

  /** All other props are passed to the useReactTable hook */
};

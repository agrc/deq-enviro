import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { forwardRef, useRef, useState } from 'react';
import { useVirtual } from 'react-virtual';
import { twJoin, twMerge } from 'tailwind-merge';

// note: I tried v3 beta of react-virtual but it didn't quite work

/** InnerTable */
function InnerTable(
  { columns, data, className, caption, ...props },
  forwardedRef,
) {
  const [sorting, setSorting] = useState(props?.initialState?.sorting ?? []);
  const { getHeaderGroups, getRowModel } = useReactTable({
    columns,
    data,
    // @ts-expect-error - Type checking bypass needed
    getCoreRowModel: getCoreRowModel(),
    // @ts-expect-error - Type checking bypass needed
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    ...props,
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
        className,
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="h-full overflow-y-auto" ref={parentRef} tabIndex={0}>
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{caption}</caption>
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
                        {{
                          asc: (
                            <ChevronUpIcon
                              className="mr-1 size-5"
                              label="sorted ascending"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              className="mr-1 size-5"
                              label="sorted descending"
                            />
                          ),
                        }[header.column.getIsSorted()] ?? null}
                        <button
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="user-select-none absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none hover:bg-slate-200"
                          tabIndex={0}
                          aria-label="Resize column"
                        />
                      </div>
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
                    'group/row border-y border-y-slate-300',
                    // using the even pseudo-class doesn't work since the virtualizer is always changing the rendered rows
                    virtualRow.index % 2 ? 'bg-white' : 'bg-slate-100',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="truncate p-2"
                      // @ts-expect-error - Type checking bypass needed
                      title={cell.getValue()}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
}

const Table = forwardRef(InnerTable);

InnerTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  caption: PropTypes.string.isRequired,
  initialState: PropTypes.shape({
    sorting: PropTypes.array,
  }),
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  caption: PropTypes.string.isRequired,
  initialState: PropTypes.shape({
    sorting: PropTypes.array,
  }),
};

export default Table;

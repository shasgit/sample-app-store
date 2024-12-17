import * as React from 'react';
import {
  DataGridPro,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridFilterModel,
  useGridApiRef,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid-pro';
import Export from './Export';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First Name', width: 150 },
  { field: 'lastName', headerName: 'Last Name', width: 150 },
  { field: 'country', headerName: 'Country', width: 70 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'salary', headerName: 'Salary', width: 150 },
];

const rows: GridRowsProp = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', country: 'DE', department: 'ABC', salary: 1000 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', country: 'IN', department: 'XYZ', salary: 1200 },
  { id: 3, lastName: 'Stark', firstName: 'Arya', country: 'USA', department: 'MNO', salary: 1500 },
];

// A simple helper function to apply filter logic.
// For demonstration, we handle 'contains' and 'equals' operators.
// Extend this logic as needed for other operators.
function applyFilter(rowData: any[], filterModel: any): any[] {
  const { items } = filterModel || {};
  if (!items || items.length === 0) return rowData;

  return rowData.filter((row) => {
    return items.every((filterItem: any) => {
      const { field, operator, value } = filterItem;
      const cellValue = row[field];
      if (value == null || value === '') {
        // If there's no value in filter, skip this filter
        return true;
      }

      const cellValueStr = cellValue == null ? '' : String(cellValue);

      switch (operator) {
        case 'contains':
          return cellValueStr.toLowerCase().includes(value.toLowerCase());
        case 'equals':
          return cellValueStr.toLowerCase() === value.toLowerCase();
        // Add more cases as needed, e.g., 'startsWith', 'endsWith', etc.
        default:
          // If operator is not handled, just pass
          return true;
      }
    });
  });
}

export default function App() {
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState<GridColumnVisibilityModel>({
    lastName: false     // Hide the 'lastName' column
  });
  const apiRef = useGridApiRef();

  const getDownloadData = (): [Array<Record<string, string>>, Array<Record<string, string>>] => {
    if (!apiRef.current) return[[],[]];

    const { columns: columnsState, sorting, rows: rowsState } = apiRef.current.state;

    const { orderedFields, columnVisibilityModel } = columnsState;
    const { sortModel } = sorting;

    // Get all column definitions from the api
    const allColumns: GridColDef[] = apiRef.current.getAllColumns();

    // Determine visible columns in the correct order
    const visibleColumnFields = orderedFields.filter(
      (field) => columnVisibilityModel[field] !== false
    );

    const visibleColumns = visibleColumnFields
      .map((field) => allColumns.find((col) => col.field === field))
      .filter((col) => !!col); // Ensure non-null

    // Get the rows as a map of (id -> row)
    const rowModels = apiRef.current.getRowModels();
    let rowDataArray = Array.from(rowModels.values());

    if(filterModel.items.length) {
        //Apply Filter if required
        rowDataArray = applyFilter(rowDataArray, filterModel);
    }

    // Apply sorting if sortModel is present
    // For simplicity, assume single-column sorting
    if (sortModel.length > 0) {
      const { field: sortField, sort } = sortModel[0];

      const columnToSort = visibleColumns.find((col) => col.field === sortField);
      if (columnToSort && sort) {
        rowDataArray = [...rowDataArray].sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];

          // Basic sorting logic for strings/numbers
          if (aValue == null && bValue != null) return sort === 'asc' ? -1 : 1;
          if (bValue == null && aValue != null) return sort === 'asc' ? 1 : -1;
          if (aValue == null && bValue == null) return 0;

          if (aValue < bValue) return sort === 'asc' ? -1 : 1;
          if (aValue > bValue) return sort === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    const headers = visibleColumns.map((col) => { return { header: col.headerName || col.field, field: col.field } });

    return [headers, rowDataArray];
    
  }

  return (
    <div style={{ height: "100%", width: '100%' }}>
      <Export getDownloadData={() => {
        return getDownloadData();
      }} />
      <DataGridPro
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
      />
    </div>
  );
}

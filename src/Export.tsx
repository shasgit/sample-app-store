
export default function Export({ getDownloadData }: { getDownloadData: () => [Array<Record<string, string>>, Array<Record<string, string>>] }) {

    const handleExportCSV = () => {
        const [headers, rowDataArray] = getDownloadData();
        const csvRows = rowDataArray.map((row) =>
            headers.map((col) => {
                const val = row[col.field];
                // Escape values that contain commas or quotes
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`; // double quotes inside a quoted field are escaped by doubling
                }
                return val == null ? '' : val;
            })
        );

        const csvContent = [
            headers.map((header) => header.header).join(','),
            ...csvRows.map((r) => r.join(',')),
        ].join('\n');

        // Trigger file download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return <button onClick={handleExportCSV}>Export CSV</button>
}
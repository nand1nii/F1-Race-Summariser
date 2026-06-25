export default function RaceReport({ report }) {
  if (!report) return null;

  const lines = report.split('\n');
  const elements = [];
  let tableRows = [];
  let tableHeaders = [];
  let inTable = false;

  function flushTable() {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                {tableHeaders.map((h, i) => <th key={i}>{h.trim()}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{cell.trim()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.length > 0);
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        inTable = true;
        continue;
      }
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells;
        continue;
      }
      if (inTable) {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="report-h1">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="report-h2">{line.slice(3)}</h2>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="report-li" dangerouslySetInnerHTML={{ __html: parseBold(line.slice(2)) }} />);
    } else if (line.startsWith('**') && line.includes('**')) {
      elements.push(<p key={i} className="report-p" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="report-spacer" />);
    } else {
      elements.push(<p key={i} className="report-p" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />);
    }
  }

  if (inTable) flushTable();

  return <div className="race-report">{elements}</div>;
}

function parseBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

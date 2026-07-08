const verdictClass = {
  AC: "verdict-ac",
  WA: "verdict-wa",
  TLE: "verdict-tle",
  CE: "verdict-ce"
};

export default function SubmissionTable({ rows }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Problem</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Runtime</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.problem}</td>
              <td>{row.language}</td>
              <td>
                <span className={`verdict ${verdictClass[row.verdict]}`}>{row.verdict}</span>
              </td>
              <td>{row.runtime}</td>
              <td>{row.submitted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

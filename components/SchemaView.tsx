
import React from 'react';

const SchemaView: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Database Schema (PostgreSQL)</h2>
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-3 text-indigo-600">Core Hierarchy Tables</h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Table</th>
                  <th className="px-6 py-3 font-semibold">Key Columns</th>
                  <th className="px-6 py-3 font-semibold">Relationships</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-4 font-medium">pillars</td>
                  <td className="px-6 py-4">id (UUID), name (VARCHAR)</td>
                  <td className="px-6 py-4">Root level</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">sectors</td>
                  <td className="px-6 py-4">id (UUID), pillar_id (FK), name</td>
                  <td className="px-6 py-4">M:1 with pillars</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">outcomes</td>
                  <td className="px-6 py-4">id (UUID), sector_id (FK), name</td>
                  <td className="px-6 py-4">M:1 with sectors</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">outputs</td>
                  <td className="px-6 py-4">id (UUID), outcome_id (FK), name</td>
                  <td className="px-6 py-4">M:1 with outcomes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">indicators</td>
                  <td className="px-6 py-4">id (UUID), output_id (FK), name, baseline, source_of_data</td>
                  <td className="px-6 py-4">M:1 with outputs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-indigo-600">Performance Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 text-slate-100 p-6 rounded-xl font-mono text-xs leading-relaxed">
              <p className="text-indigo-300 font-bold mb-2">-- Performance Tracker Table</p>
              CREATE TABLE performance_metrics (<br/>
              &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
              &nbsp;&nbsp;indicator_id UUID REFERENCES indicators(id),<br/>
              &nbsp;&nbsp;fiscal_year INT NOT NULL,<br/>
              &nbsp;&nbsp;quarter INT CHECK (quarter BETWEEN 1 AND 4),<br/>
              &nbsp;&nbsp;target NUMERIC(15,2),<br/>
              &nbsp;&nbsp;achievement NUMERIC(15,2),<br/>
              &nbsp;&nbsp;comment TEXT,<br/>
              &nbsp;&nbsp;updated_at TIMESTAMP DEFAULT NOW()<br/>
              );
            </div>
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
              <h4 className="font-semibold mb-2">Roll-up Logic Pseudo-code</h4>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                1. Individual Score = (Achievement / Target) * 100 <br/>
                2. Parent Output Score = AVG(Score of child Indicators) <br/>
                3. Outcome Score = AVG(Score of child Outputs) <br/>
                4. Final Pillar Score = Weighted or Simple AVG of Sectors
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchemaView;

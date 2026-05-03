import { useEffect, useState } from "react";
import Chart from "./Chart";

function Dashboard() {
  const [data, setData] = useState([]);
  const [teamFilter, setTeamFilter] = useState("All");

const teams = ["All", ...new Set(data.map(d => d.team))];

  useEffect(() => {
    fetch("http://localhost:5000/metrics")
      .then(res => res.json())
      .then(result => setData(result))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      
      <h1 className="title">🚀 Developer Performance Dashboard</h1>
      
      
<select
      value={teamFilter}
      onChange={(e) => setTeamFilter(e.target.value)}
      style={{
        padding: "10px",
        margin: "15px 0",
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      {teams.map((team, i) => (
        <option key={i} value={team}>
          {team}
        </option>
      ))}
    </select>

    {/* 👇 DATA CARDS BELOW */}
    {data
      .filter(dev => teamFilter === "All" || dev.team === teamFilter)
      .map((dev, index) => (
        <div key={index}>
          <h3>{dev.developer_name}</h3>
        </div>
      ))}
      <div style={{
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  margin: "30px auto",
  width: "80%",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
}}>
  <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
    📊 Cycle Time Comparison
  </h3>

  <Chart data={data} />
</div>
       

      <p className="count">Total Developers: {data.length}</p>

      <div className="grid">
        
        {data
         .filter(dev => teamFilter === "All" || dev.team === teamFilter)
        .map((dev, index) => (
          
          <div className="card" key={index}>
            <h2>{dev.developer_name}</h2>
            <p className="team">{dev.team}</p>

            <div className="metrics">
              <div className="box">
                <span>Cycle</span>
                <b>{dev.avgCycle}</b>
              </div>
              <div className="box">
                <span>Lead</span>
                <b>{dev.avgLead}</b>
              </div>
              <div className="box">
                <span>PR</span>
                <b>{dev.prThroughput}</b>
              </div>
              <div className="box">
                <span>Deploy</span>
                <b>{dev.deploymentFreq}</b>
              </div>
            </div>

            <p className={`bug ${dev.bugRate > 30 ? "red" : "green"}`} >
              🐞 Bug Rate: {dev.bugRate}%
            </p>

            <div className="section">
              <h4>⚠ Problems</h4>
              {dev.problems.length === 0 ? (
                <p className="good">No issues 👍</p>
              ) : (
                <ul>
                  {dev.problems.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section">
              <h4>✅ Actions</h4>
              {dev.actions.length === 0 ? (
                <p className="good">All good 🚀</p>
              ) : (
                <ul>
                  {dev.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
     
    </div>
  );
}

export default Dashboard;
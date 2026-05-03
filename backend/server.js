const express = require("express");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
app.use(cors());


const path = require("path");

const workbook = XLSX.readFile(
  path.join(__dirname, "data.xlsx")
);

// Sheets
const devData = XLSX.utils.sheet_to_json(
  workbook.Sheets["Dim_developers"]
);

const jiraData = XLSX.utils.sheet_to_json(
  workbook.Sheets["Fact_Jira_Issues"]
);

const prData = XLSX.utils.sheet_to_json(
  workbook.Sheets["Fact_Pull_Requests"]
);

const deployData = XLSX.utils.sheet_to_json(
  workbook.Sheets["Fact_CI_Deployments"]
);

const bugData = XLSX.utils.sheet_to_json(
  workbook.Sheets["Fact_Bug_Reports"]
);


const devMap = {};
devData.forEach(d => {
  devMap[d.developer_id] = d;
});


function groupByDev(data) {
  return data.reduce((acc, item) => {
    const dev = item.developer_id;
    if (!acc[dev]) acc[dev] = [];
    acc[dev].push(item);
    return acc;
  }, {});
}

function getProblems(dev) {
  let problems = [];

  if (dev.avgCycle > 5) problems.push("High cycle time");
  if (parseFloat(dev.bugRate) > 30) problems.push("High bug rate");
  if (dev.deploymentFreq < 2) problems.push("Low deployment frequency");

  return problems;
}

function getActions(problems) {
  let actions = [];

  problems.forEach(p => {
    if (p === "High cycle time") {
      actions.push("Break tasks into smaller pieces");
    }
    if (p === "High bug rate") {
      actions.push("Improve testing before deployment");
    }
    if (p === "Low deployment frequency") {
      actions.push("Increase release frequency");
    }
  });

  return actions;
}

console.log("Sheets:", workbook.SheetNames);

app.get("/metrics", (req, res) => {
  const jiraByDev = groupByDev(jiraData);
  const prByDev = groupByDev(prData);
  const deployByDev = groupByDev(deployData);
  const bugByDev = groupByDev(bugData);

  const result = [];

  for (let dev in jiraByDev) {
    const jira = jiraByDev[dev] || [];
    const pr = prByDev[dev] || [];
    const deploy = deployByDev[dev] || [];
    const bugs = bugByDev[dev] || [];

    const devInfo = devMap[dev] || {};

    // Metrics
    const avgCycle =
      jira.reduce((sum, j) => sum + j.cycle_time_days, 0) /
      (jira.length || 1);

    const avgLead =
      pr.reduce((sum, p) => sum + p.merge_time_hours, 0) /
      (pr.length || 1);

    const prThroughput = pr.length;
    const deploymentFreq = deploy.length;
    const bugRate = bugs.length / (jira.length || 1);

    const devObj = {
      developer_id: dev,
      developer_name: devInfo.developer_name || "N/A",
      manager: devInfo.manager_name || "N/A",
      team: devInfo.team_name || "N/A",
      level: devInfo.level || "N/A",

      avgCycle: avgCycle.toFixed(2),
      avgLead: avgLead.toFixed(2),
      prThroughput,
      deploymentFreq,
      bugRate: (bugRate * 100).toFixed(1)
    };

    const problems = getProblems(devObj);
    const actions = getActions(problems);

    result.push({
      ...devObj,
      problems,
      actions
    });
  }

  res.json(result);
});

// START SERVER

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000/metrics");
});
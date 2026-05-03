import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Chart({ data }) {
  const chartData = {
    labels: data.map(d => d.developer_id),
    datasets: [
      {
        label: "Cycle Time",
        data: data.map(d => Number(d.avgCycle)),
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{ width: "50%", margin: "20px auto", alignItems:"center" }}>
      <Bar data={chartData} />
    </div>
  );
}

export default Chart;
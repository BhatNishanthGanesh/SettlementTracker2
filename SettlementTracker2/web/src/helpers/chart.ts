import {
  TripData,
  ChartData,
  GroupChartData,
} from "@/types/trip.types";

export function generateSpendingChart(
  data: TripData[]
): ChartData {
  const sorted = [...data].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );

  return {
    labels: sorted.map((trip) =>
      trip.name.length > 15
        ? trip.name.slice(0, 15) + "..."
        : trip.name
    ),

    datasets: [
      {
        label: "Spent",
        data: sorted.map((t) => t.spent),
        backgroundColor: "rgba(99,102,241,.6)",
        borderColor: "rgba(99,102,241,1)",
        borderWidth: 2,
      },
      {
        label: "Owed to Me",
        data: sorted.map((t) => t.owedToMe),
        backgroundColor: "rgba(52,211,153,.6)",
        borderColor: "rgba(52,211,153,1)",
        borderWidth: 2,
      },
    ],
  };
}

export function generateGroupChart(
  data: TripData[]
): GroupChartData {
  const categories: Record<string, number> = {};

  data.forEach((trip) => {
    const key = trip.category || "Other";

    categories[key] =
      (categories[key] || 0) + trip.spent;
  });

  const colors = [
    "rgba(99,102,241,.8)",
    "rgba(52,211,153,.8)",
    "rgba(251,191,36,.8)",
    "rgba(244,63,94,.8)",
    "rgba(56,189,248,.8)",
    "rgba(168,85,247,.8)",
    "rgba(236,72,153,.8)",
    "rgba(251,146,60,.8)",
  ];

  return {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: colors.slice(
          0,
          Object.keys(categories).length
        ),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };
}